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

function handleOrientation(event) {
    if (!orientationEnabled) return;

    if (!initialOrientation) {
        initialOrientation = {
            alpha: event.alpha || 0,
            beta: event.beta || 0,
            gamma: event.gamma || 0
        };
    }

    let alpha = (event.alpha || 0) - initialOrientation.alpha;
    let beta = (event.beta || 0) - initialOrientation.beta;
    let gamma = (event.gamma || 0) - initialOrientation.gamma;

    // Convert to radians
    alpha = alpha * Math.PI / 180;
    beta = beta * Math.PI / 180;
    gamma = gamma * Math.PI / 180;

    // Create quaternion from Euler angles
    let euler = new THREE.Euler(beta, alpha, -gamma, 'YXZ');
    camera.quaternion.setFromEuler(euler);
}

function enableOrientation() {
    console.log('enableOrientation called');
    if (orientationEnabled) return;

    // Request permission for device orientation on iOS
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        console.log('Requesting permission for iOS');
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                console.log('Permission state:', permissionState);
                if (permissionState === 'granted') {
                    orientationEnabled = true;
                    console.log('Device orientation permission granted');
                    window.addEventListener('deviceorientation', handleOrientation, false);
                    // Remove the enable button
                    let button = document.getElementById('enable-vr');
                    if (button) button.remove();
                } else {
                    console.log('Device orientation permission denied');
                }
            })
            .catch(console.error);
    } else {
        // For non-iOS 13+ devices
        console.log('Enabling for non-iOS devices');
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

    enableButton.addEventListener('click', () => {
        console.log('Button clicked');
        enableOrientation();
    });

    // Also enable on touch for mobile
    window.addEventListener('touchstart', () => {
        console.log('Touch detected');
        enableOrientation();
    });
} else {
    console.log('Device orientation not supported');
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