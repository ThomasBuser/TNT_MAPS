// Define initMap in the global scope immediately
window.initMap = function() {
    // Show loading popup immediately
    showLocationDetectionPopup();
    
    window.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: { lat: 46.9479739, lng: 7.4474468 }, // Default center (Bern, Switzerland)
    });

    const input = document.getElementById("pac-input");
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo("bounds", window.map);
    autocomplete.setTypes(["establishment"]);

    // Create a blue dot for current location (default state)
    window.marker = new google.maps.Marker({
        map: window.map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF'
        }
    });

    // Create a red location pin for destination
    window.destinationMarker = new google.maps.Marker({
        map: window.map,
        icon: {
            url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
                    <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(24, 32),
            anchor: new google.maps.Point(12, 32)
        },
        visible: false
    });

    window.directionsService = new google.maps.DirectionsService();
    window.directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false, // Changed to false to show start/end markers
        suppressInfoWindows: true,
        preserveViewport: true, // Changed to true to prevent auto-zoom
        markerOptions: {
            visible: false // We'll use our custom markers instead
        }
    });
    window.directionsRenderer.setMap(window.map);

    // Navigation variables
    window.currentLocation = null;
    window.travelMode = google.maps.TravelMode.DRIVING;
    window.navigationActive = false;
    window.destination = null;
    window.routeSteps = [];
    window.currentStepIndex = 0;
    window.watchId = null;
    window.locationDetected = false;
    window.currentHeading = 0; // Store current heading/bearing
    window.previousLocation = null; // Store previous location for bearing calculation

    // Create navigation panel
    createNavigationPanel();

    // Wait for map to be fully loaded before starting geolocation
    google.maps.event.addListenerOnce(window.map, 'idle', function() {
        console.log("Map is fully loaded, starting geolocation...");
        // Add a small delay to ensure everything is ready
        setTimeout(() => {
            initGeolocation();
        }, 500);
    });

    window.setTravelMode = function(mode) {
        window.travelMode = google.maps.TravelMode[mode];

        if (mode === "DRIVING") {
            // Check if location detection is still in progress
            if (!window.locationDetected) {
                alert("Standortermittlung läuft noch. Bitte warten Sie, bis Ihr Standort gefunden wurde.");
                return;
            }
            
            if (!window.currentLocation) {
                alert("Aktueller Standort nicht verfügbar. Bitte warten Sie, bis Ihr Standort ermittelt wurde, oder versuchen Sie die Seite neu zu laden.");
                return;
            }
            
            if (!window.destination) {
                alert("Bitte wählen Sie zuerst ein Ziel aus.");
                return;
            }
            
            // Start navigation mode
            startNavigation();
        } else {
            // For other modes (walking, transit), just update the route
            stopNavigation();
            if (window.currentLocation && window.destination) {
                calculateAndDisplayRoute(window.currentLocation, window.destination);
            }
        }
    };

    function createNavigationArrow(rotation = 0) {
        return {
            path: 'M 0,-8 L -4,8 L 0,4 L 4,8 Z',
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
            scale: 2,
            rotation: rotation,
            anchor: new google.maps.Point(0, 0)
        };
    }

    function updateMarkerIcon(isNavigating) {
        if (isNavigating) {
            // Switch to arrow icon
            window.marker.setIcon(createNavigationArrow(window.currentHeading));
        } else {
            // Switch back to blue dot
            window.marker.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#FFFFFF'
            });
        }
    }

    function calculateBearing(from, to) {
        const lat1 = from.lat * Math.PI / 180;
        const lat2 = to.lat * Math.PI / 180;
        const deltaLng = (to.lng - from.lng) * Math.PI / 180;

        const x = Math.sin(deltaLng) * Math.cos(lat2);
        const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

        const bearing = Math.atan2(x, y);
        return (bearing * 180 / Math.PI + 360) % 360;
    }

    function startNavigation() {
        window.navigationActive = true;
        
        console.log("Starting navigation, current location:", window.currentLocation);
        
        // Show navigation panel first
        document.getElementById('navigationPanel').style.display = 'block';
        
        // Set navigation map properties
        window.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        
        // Switch to arrow icon
        updateMarkerIcon(true);
        
        // Calculate route first, then zoom will be applied in the callback
        calculateAndDisplayRoute(window.currentLocation, window.destination, true);
        
        // Start high-frequency position tracking for navigation
        startNavigationTracking();
        
        console.log("Navigation started - zoom will be applied after route calculation");
    }

    window.stopNavigation = function() {
        window.navigationActive = false;
        window.currentStepIndex = 0;
        
        // Hide navigation panel
        document.getElementById('navigationPanel').style.display = 'none';
        
        // Stop high-frequency tracking
        if (window.watchId) {
            navigator.geolocation.clearWatch(window.watchId);
            window.watchId = null;
        }
        
        // Reset map view
        window.map.setZoom(13);
        window.map.setTilt(0);
        
        // Switch back to blue dot
        updateMarkerIcon(false);
        
        // Keep destination marker visible after stopping navigation
        if (window.destination) {
            window.destinationMarker.setVisible(true);
        }
    };

    function createNavigationPanel() {
        const navPanel = document.createElement('div');
        navPanel.id = 'navigationPanel';
        navPanel.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            padding: 15px;
            z-index: 1000;
            display: none;
            font-family: Arial, sans-serif;
        `;
        
        navPanel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #1976D2;">Navigation</h3>
                <button onclick="window.stopNavigation()" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Stop</button>
            </div>
            <div id="currentInstruction" style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333;"></div>
            <div id="nextInstruction" style="font-size: 14px; color: #666; margin-bottom: 10px;"></div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #888;">
                <span id="distanceToStep"></span>
                <span id="timeRemaining"></span>
            </div>
        `;
        
        document.getElementById('map').appendChild(navPanel);
    }

    function calculateAndDisplayRoute(origin, destination, isNavigation = false) {
        window.directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: window.travelMode,
                provideRouteAlternatives: false,
                drivingOptions: {
                    departureTime: new Date(),
                    trafficModel: 'bestguess'
                },
                unitSystem: google.maps.UnitSystem.METRIC
            },
            function(response, status) {
                if (status === "OK") {
                    window.directionsRenderer.setDirections(response);
                    
                    // Show destination marker
                    window.destinationMarker.setPosition(destination);
                    window.destinationMarker.setVisible(true);
                    
                    if (isNavigation) {
                        // Store route steps for navigation
                        window.routeSteps = response.routes[0].legs[0].steps;
                        window.currentStepIndex = 0;
                        updateNavigationDisplay();
                        
                        // Apply navigation zoom immediately after route is set
                        console.log("Applying navigation zoom to current location");
                        window.map.setCenter(window.currentLocation);
                        window.map.setZoom(18);
                        window.map.setTilt(45);
                        
                        // Calculate initial heading based on first route step
                        if (window.routeSteps.length > 0) {
                            const firstStep = window.routeSteps[0];
                            const stepStart = {
                                lat: firstStep.start_location.lat(),
                                lng: firstStep.start_location.lng()
                            };
                            const stepEnd = {
                                lat: firstStep.end_location.lat(),
                                lng: firstStep.end_location.lng()
                            };
                            window.currentHeading = calculateBearing(stepStart, stepEnd);
                            updateMarkerIcon(true);
                        }
                        
                    } else if (!window.navigationActive) {
                        // Fit bounds only when not in navigation mode
                        const bounds = new google.maps.LatLngBounds();
                        bounds.extend(origin);
                        bounds.extend(destination);
                        window.map.fitBounds(bounds, {
                            top: 50, right: 50, bottom: 50, left: 50
                        });
                    }
                } else {
                    console.error("Directions request failed: " + status);
                }
            }
        );
    }

    function startNavigationTracking() {
        if (window.watchId) {
            navigator.geolocation.clearWatch(window.watchId);
        }
        
        window.watchId = navigator.geolocation.watchPosition(
            position => {
                updateCurrentLocation(position);
                if (window.navigationActive) {
                    updateNavigationProgress(position);
                }
            },
            error => {
                console.warn("Navigation tracking error:", error);
            },
            { 
                enableHighAccuracy: true,
                maximumAge: 1000, // 1 second for navigation
                timeout: 3000
            }
        );
    }

    function updateNavigationProgress(position) {
        const currentPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        
        // Calculate bearing/heading if we have a previous location
        if (window.previousLocation) {
            window.currentHeading = calculateBearing(window.previousLocation, currentPos);
            // Update arrow rotation
            window.marker.setIcon(createNavigationArrow(window.currentHeading));
        }
        
        // Store current location as previous for next update
        window.previousLocation = currentPos;
        
        // Center map on current location during navigation
        window.map.setCenter(currentPos);
        
        // Check if we've reached the current step
        if (window.routeSteps.length > 0 && window.currentStepIndex < window.routeSteps.length) {
            const currentStep = window.routeSteps[window.currentStepIndex];
            const stepEndLocation = {
                lat: currentStep.end_location.lat(),
                lng: currentStep.end_location.lng()
            };
            
            const distanceToStepEnd = calculateDistance(currentPos, stepEndLocation);
            
            // If we're within 20 meters of the step end, move to next step
            if (distanceToStepEnd < 20) {
                window.currentStepIndex++;
                if (window.currentStepIndex < window.routeSteps.length) {
                    updateNavigationDisplay();
                    // Optional: Add voice announcement
                    announceInstruction(window.routeSteps[window.currentStepIndex].instructions);
                } else {
                    // Reached destination
                    announceArrival();
                }
            } else {
                // Update distance to next maneuver
                updateDistanceDisplay(distanceToStepEnd);
            }
        }
    }

    function updateNavigationDisplay() {
        if (window.currentStepIndex >= window.routeSteps.length) {
            document.getElementById('currentInstruction').textContent = 'Destination erreicht!';
            document.getElementById('nextInstruction').textContent = '';
            document.getElementById('distanceToStep').textContent = '';
            return;
        }
        
        const currentStep = window.routeSteps[window.currentStepIndex];
        const nextStep = window.currentStepIndex + 1 < window.routeSteps.length ? 
                        window.routeSteps[window.currentStepIndex + 1] : null;
        
        // Clean up HTML from instructions
        const cleanInstruction = currentStep.instructions.replace(/<[^>]*>/g, '');
        document.getElementById('currentInstruction').textContent = cleanInstruction;
        
        if (nextStep) {
            const nextCleanInstruction = nextStep.instructions.replace(/<[^>]*>/g, '');
            document.getElementById('nextInstruction').textContent = `Dann: ${nextCleanInstruction}`;
        } else {
            document.getElementById('nextInstruction').textContent = 'Dann: Ziel erreicht';
        }
        
        // Update distance
        document.getElementById('distanceToStep').textContent = currentStep.distance.text;
        
        // Calculate remaining time
        let remainingTime = 0;
        for (let i = window.currentStepIndex; i < window.routeSteps.length; i++) {
            remainingTime += window.routeSteps[i].duration.value;
        }
        
        const minutes = Math.round(remainingTime / 60);
        document.getElementById('timeRemaining').textContent = `${minutes} Min verbleibend`;
    }

    function updateDistanceDisplay(distanceMeters) {
        const distanceText = distanceMeters > 1000 ? 
            `${(distanceMeters / 1000).toFixed(1)} km` : 
            `${Math.round(distanceMeters)} m`;
        document.getElementById('distanceToStep').textContent = distanceText;
    }

    function calculateDistance(pos1, pos2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = pos1.lat * Math.PI/180;
        const φ2 = pos2.lat * Math.PI/180;
        const Δφ = (pos2.lat-pos1.lat) * Math.PI/180;
        const Δλ = (pos2.lng-pos1.lng) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    }

    function announceInstruction(instruction) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(instruction.replace(/<[^>]*>/g, ''));
            utterance.lang = 'de-DE';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    }

    function announceArrival() {
        document.getElementById('currentInstruction').textContent = 'Ziel erreicht!';
        document.getElementById('nextInstruction').textContent = 'Navigation beendet';
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance('Ziel erreicht. Navigation beendet.');
            utterance.lang = 'de-DE';
            speechSynthesis.speak(utterance);
        }
        
        // Auto-stop navigation after 5 seconds
        setTimeout(() => {
            stopNavigation();
        }, 5000);
    }

    function showLocationDetectionPopup() {
        const popup = document.createElement('div');
        popup.id = 'locationDetectionPopup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            padding: 25px;
            z-index: 2000;
            text-align: center;
            min-width: 280px;
            font-family: Arial, sans-serif;
        `;
        
        popup.innerHTML = `
            <div style="margin-bottom: 15px;">
                <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4285F4; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <h3 style="margin: 0 0 10px 0; color: #333;">Karte wird geladen...</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">Standort wird ermittelt, bitte warten Sie einen Moment.</p>
            </div>
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(popup);
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.id = 'locationDetectionOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1999;
        `;
        document.body.appendChild(overlay);
    }

    function updateLocationDetectionPopup(message) {
        const popup = document.getElementById('locationDetectionPopup');
        if (popup) {
            const textElement = popup.querySelector('p');
            if (textElement) {
                textElement.textContent = message;
            }
        }
    }

    function hideLocationDetectionPopup() {
        const popup = document.getElementById('locationDetectionPopup');
        const overlay = document.getElementById('locationDetectionOverlay');
        
        if (popup) popup.remove();
        if (overlay) overlay.remove();
        
        window.locationDetected = true;
    }

    function initGeolocation() {
        if (!navigator.geolocation) {
            updateLocationDetectionPopup("Geolocation wird von Ihrem Browser nicht unterstützt.");
            setTimeout(() => {
                hideLocationDetectionPopup();
                showGeolocationError("Geolocation is not supported by your browser.");
            }, 2000);
            return;
        }

        updateLocationDetectionPopup("GPS-Signal wird gesucht...");

        // Try high accuracy first with longer timeout
        const highAccuracyOptions = {
            enableHighAccuracy: true,
            timeout: 20000, // 20 seconds
            maximumAge: 30000 // 30 seconds cache
        };

        // Fallback options with lower accuracy
        const fallbackOptions = {
            enableHighAccuracy: false,
            timeout: 25000, // 25 seconds
            maximumAge: 300000 // 5 minute cache
        };

        console.log("Starting high accuracy geolocation...");
        
        // Try high accuracy first
        navigator.geolocation.getCurrentPosition(
            position => {
                console.log("High accuracy location obtained:", position);
                hideLocationDetectionPopup();
                updateCurrentLocation(position);
                startPositionTracking();
                showLocationSuccessMessage();
            },
            error => {
                console.warn("High accuracy failed, trying fallback:", error);
                updateLocationDetectionPopup("Genauere Ortung fehlgeschlagen, versuche alternative Methode...");
                
                // Try fallback method
                navigator.geolocation.getCurrentPosition(
                    position => {
                        console.log("Fallback location obtained:", position);
                        hideLocationDetectionPopup();
                        updateCurrentLocation(position);
                        startPositionTracking();
                        showLocationSuccessMessage("Standort mit reduzierter Genauigkeit ermittelt.");
                    },
                    fallbackError => {
                        console.error("Both location methods failed:", fallbackError);
                        hideLocationDetectionPopup();
                        handleGeolocationError(fallbackError);
                    },
                    fallbackOptions
                );
            },
            highAccuracyOptions
        );
    }

    function showLocationSuccessMessage(customMessage = null) {
        const message = customMessage || "Standort erfolgreich ermittelt!";
        const successDiv = document.createElement('div');
        successDiv.textContent = message;
        successDiv.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);background:#e8f5e8;color:#2e7d32;padding:12px 20px;border-radius:8px;z-index:1000;box-shadow:0 2px 10px rgba(0,0,0,0.2);font-weight:bold;';
        document.getElementById('map').appendChild(successDiv);
        
        setTimeout(() => successDiv.remove(), 3000);
    }

    function startPositionTracking() {
        if (!window.navigationActive) {
            navigator.geolocation.watchPosition(
                position => {
                    updateCurrentLocation(position);
                    if (window.destination && !window.navigationActive) {
                        calculateAndDisplayRoute(window.currentLocation, window.destination);
                    }
                },
                error => {
                    console.warn("Position tracking error:", error);
                },
                { 
                    enableHighAccuracy: true,
                    maximumAge: 5000,
                    timeout: 10000
                }
            );
        }
    }

    function updateCurrentLocation(position) {
        window.currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        
        window.marker.setPosition(window.currentLocation);
        window.marker.setVisible(true);
        
        if (!window.destination && !window.navigationActive) {
            window.map.setCenter(window.currentLocation);
        }
    }

    function handleGeolocationError(error) {
        let errorMessage;
        let troubleshootingTips = "";
        
        switch(error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Standortberechtigung verweigert.";
                troubleshootingTips = "Bitte aktivieren Sie die Standortdienste in Ihren Browser-Einstellungen und laden Sie die Seite neu.";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Standortinformationen sind nicht verfügbar.";
                troubleshootingTips = "Mögliche Lösungen: 1) Überprüfen Sie Ihre Internetverbindung 2) Gehen Sie nach draußen für besseren GPS-Empfang 3) Stellen Sie sicher, dass Standortdienste auf Ihrem Gerät aktiviert sind 4) Versuchen Sie es in einem anderen Browser";
                break;
            case error.TIMEOUT:
                errorMessage = "Zeitüberschreitung bei der Standortbestimmung.";
                troubleshootingTips = "Dies kann bei schwachem GPS-Signal auftreten. Versuchen Sie es erneut oder gehen Sie an einen Ort mit besserem Empfang.";
                break;
            default:
                errorMessage = "Ein unbekannter Fehler ist bei der Standortbestimmung aufgetreten.";
                troubleshootingTips = "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.";
                break;
        }
        
        showGeolocationError(errorMessage, troubleshootingTips);
    }

    function showGeolocationError(message, tips = "") {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);background:#ffebee;border:1px solid #f44336;padding:15px;border-radius:8px;z-index:1000;max-width:80%;text-align:left;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
        
        errorDiv.innerHTML = `
            <div style="color:#d32f2f;font-weight:bold;margin-bottom:8px;">⚠️ Standortfehler</div>
            <div style="color:#333;margin-bottom:10px;">${message}</div>
            ${tips ? `<div style="color:#666;font-size:12px;margin-bottom:10px;">${tips}</div>` : ''}
            <div style="text-align:center;">
                <button id="manualLocationBtn" style="background:#2196F3;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;margin-right:8px;">Manuell eingeben</button>
                <button id="retryLocationBtn" style="background:#4CAF50;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">Erneut versuchen</button>
            </div>
        `;
        
        document.getElementById('map').appendChild(errorDiv);
        
        // Add event listeners
        document.getElementById('retryLocationBtn').onclick = function() {
            errorDiv.remove();
            initGeolocation();
        };
        
        document.getElementById('manualLocationBtn').onclick = function() {
            errorDiv.remove();
            showManualLocationInput();
        };
    }

    function showManualLocationInput() {
        const inputDiv = document.createElement('div');
        inputDiv.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);background:white;border:1px solid #ccc;padding:15px;border-radius:8px;z-index:1000;max-width:80%;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
        
        inputDiv.innerHTML = `
            <div style="margin-bottom:10px;font-weight:bold;">Standort manuell eingeben</div>
            <input type="text" id="manualLocationInput" placeholder="z.B. Bern, Schweiz oder Postleitzahl" style="width:200px;padding:8px;margin-bottom:10px;border:1px solid #ccc;border-radius:4px;">
            <br>
            <button id="searchManualLocation" style="background:#4CAF50;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;margin-right:8px;">Suchen</button>
            <button id="cancelManualLocation" style="background:#f44336;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;">Abbrechen</button>
        `;
        
        document.getElementById('map').appendChild(inputDiv);
        
        document.getElementById('searchManualLocation').onclick = function() {
            const address = document.getElementById('manualLocationInput').value;
            if (address.trim()) {
                geocodeAddress(address, inputDiv);
            }
        };
        
        document.getElementById('cancelManualLocation').onclick = function() {
            inputDiv.remove();
        };
        
        // Allow Enter key to search
        document.getElementById('manualLocationInput').onkeypress = function(e) {
            if (e.key === 'Enter') {
                document.getElementById('searchManualLocation').click();
            }
        };
    }

    function geocodeAddress(address, inputDiv) {
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ address: address }, function(results, status) {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                window.currentLocation = {
                    lat: location.lat(),
                    lng: location.lng()
                };
                
                window.marker.setPosition(window.currentLocation);
                window.marker.setVisible(true);
                window.map.setCenter(window.currentLocation);
                window.map.setZoom(15);
                
                inputDiv.remove();
                
                // Show success message
                const successDiv = document.createElement('div');
                successDiv.textContent = `Standort gefunden: ${results[0].formatted_address}`;
                successDiv.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);background:#e8f5e8;color:#2e7d32;padding:10px;border-radius:5px;z-index:1000;';
                document.getElementById('map').appendChild(successDiv);
                
                setTimeout(() => successDiv.remove(), 3000);
                
            } else {
                alert('Adresse konnte nicht gefunden werden. Bitte versuchen Sie eine andere Eingabe.');
            }
        });
    }

    // Rest of your existing code for autocomplete and other functions...
    autocomplete.addListener("place_changed", function() {
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
            alert("No details available for input: '" + place.name + "'");
            return;
        }

        window.destination = place.geometry.location;
        
        // Show destination marker
        window.destinationMarker.setPosition(window.destination);
        window.destinationMarker.setVisible(true);
        
        // Keep current location marker visible
        if (window.currentLocation) {
            window.marker.setPosition(window.currentLocation);
            window.marker.setVisible(true);
        }
        
        if (place.geometry.viewport) {
            window.map.fitBounds(place.geometry.viewport);
        } else {
            window.map.setCenter(place.geometry.location);
            window.map.setZoom(17);
        }

        if (window.currentLocation) {
            calculateAndDisplayRoute(window.currentLocation, place.geometry.location);
        } else {
            alert("Current location not available.");
        }
    });

    window.drawRouteToDestination = function(destLat, destLng) {
        if (!window.currentLocation) {
            alert("Current location not available.");
            return;
        }

        window.destination = { 
            lat: parseFloat(destLat), 
            lng: parseFloat(destLng) 
        };

        // Show destination marker
        window.destinationMarker.setPosition(window.destination);
        window.destinationMarker.setVisible(true);

        calculateAndDisplayRoute(window.currentLocation, window.destination);
    };
}; // End of initMap function

// Ensure initMap is available immediately when the script loads
if (typeof window.initMap === 'undefined') {
    console.error('initMap was not defined properly');
}