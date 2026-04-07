// Create debug display
let debugDiv = document.createElement('div');
debugDiv.id = 'debug-info';
debugDiv.style.position = 'absolute';
debugDiv.style.top = '10px';
debugDiv.style.left = '10px';
debugDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
debugDiv.style.color = 'white';
debugDiv.style.padding = '10px';
debugDiv.style.fontFamily = 'monospace';
debugDiv.style.fontSize = '12px';
debugDiv.style.zIndex = '1001';
debugDiv.style.maxWidth = '300px';
document.body.appendChild(debugDiv);

function updateDebug(info) {
    debugDiv.innerHTML = info;
}

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Device orientation controls
let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
let initialOrientation = null;  
let orientationEnabled = false;

console.log('Script loaded, DeviceOrientationEvent:', !!window.DeviceOrientationEvent);
updateDebug('Script loaded<br>DeviceOrientationEvent: ' + !!window.DeviceOrientationEvent);

function handleOrientation(event) {
    if (!orientationEnabled) return;

    if (!initialOrientation) {
        initialOrientation = {
            alpha: event.alpha || 0,
            beta: event.beta || 0,
            gamma: event.gamma || 0
        };
        console.log('Initial orientation set:', initialOrientation);
        updateDebug('Initial orientation set:<br>' + JSON.stringify(initialOrientation, null, 2));
        return; // Skip first frame to establish baseline
    }

    // Normalize angles to handle 0/359 wrapping
    let normalizeAngle = (a) => {
        a = a - initialOrientation.alpha;
        if (a > 180) a -= 360;
        if (a < -180) a += 360;
        return a;
    };

    let alpha = normalizeAngle(event.alpha || 0);
    let gamma = -((event.gamma || 0) - initialOrientation.gamma); // Invert up/down

    console.log('Orientation:', {alpha, gamma});
    updateDebug('Current orientation:<br>' +
        'Alpha (left/right): ' + alpha.toFixed(2) + '°<br>' +
        'Gamma (up/down): ' + gamma.toFixed(2) + '°<br>' +
        'VR Active!');

    // Convert to radians
    let alphaRad = alpha * Math.PI / 180;
    let gammaRad = gamma * Math.PI / 180;

    // Use alpha for yaw (left/right) and gamma for pitch (up/down)
    let euler = new THREE.Euler(gammaRad, alphaRad, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);
}

function enableOrientation() {
    console.log('enableOrientation called');
    updateDebug('enableOrientation called');
    if (orientationEnabled) return;

    // Request permission for device orientation on iOS
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        console.log('Requesting permission for iOS');
        updateDebug('Requesting permission for iOS...');
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                console.log('Permission state:', permissionState);
                updateDebug('Permission state: ' + permissionState);
                if (permissionState === 'granted') {
                    orientationEnabled = true;
                    console.log('Device orientation permission granted');
                    updateDebug('Device orientation permission granted<br>VR enabled!');
                    window.addEventListener('deviceorientation', handleOrientation, false);
                    // Remove the enable button
                    let button = document.getElementById('enable-vr');
                    if (button) button.remove();
                } else {
                    console.log('Device orientation permission denied');
                    updateDebug('Device orientation permission denied');
                }
            })
            .catch(console.error);
    } else {
        // For non-iOS 13+ devices
        console.log('Enabling for non-iOS devices');
        updateDebug('Enabling for non-iOS devices<br>VR enabled!');
        orientationEnabled = true;
        console.log('Device orientation enabled');
        window.addEventListener('deviceorientation', handleOrientation, false);
        // Remove the enable button
        let button = document.getElementById('enable-vr');
        if (button) button.remove();
    }
}

if (window.DeviceOrientationEvent) {
    console.log('DeviceOrientationEvent supported, creating button');
    updateDebug('DeviceOrientationEvent supported<br>Creating enable button...');
    // Add a button to enable VR on iOS
    let enableButton = document.createElement('button');
    enableButton.id = 'enable-vr';
    enableButton.innerHTML = 'Tap to Enable VR';
    enableButton.style.position = 'absolute';
    enableButton.style.top = '50%';
    enableButton.style.left = '50%';
    enableButton.style.transform = 'translate(-50%, -50%)';
    enableButton.style.padding = '20px';
    enableButton.style.fontSize = '20px';
    enableButton.style.zIndex = '1000';
    enableButton.style.backgroundColor = 'red';
    enableButton.style.color = 'white';
    enableButton.style.border = 'none';
    enableButton.style.borderRadius = '10px';
    document.body.appendChild(enableButton);
    console.log('Button created and added to DOM');
    updateDebug('Button created and added to DOM<br>Tap the red button to enable VR');

    enableButton.addEventListener('click', () => {
        console.log('Button clicked');
        updateDebug('Button clicked<br>Requesting permission...');
        enableOrientation();
    });

    // Also enable on touch for mobile
    window.addEventListener('touchstart', () => {
        console.log('Touch detected');
        updateDebug('Touch detected<br>Enabling orientation...');
        enableOrientation();
    });
} else {
    console.log('Device orientation not supported');
    updateDebug('Device orientation not supported');
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});