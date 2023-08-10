import * as THREE from 'three';
import { useEffect, useState, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls';
import { supabase } from "../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

function RoomPage() {
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);
  const location = useLocation();
  const uid = location.search.split("?")[1];
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    async function fetchRoom() {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("uid", uid)
        .single();
      if (error) {
        console.error(error);
      } else {
        console.log(data);
        setRoomData(data);
        setIsDataLoaded(true);
      }
    }
    fetchRoom();
  }, [navigate, uid]);

  useEffect(() => {
    const isMobile = /Mobi/.test(navigator.userAgent);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Set clear color to black (0x000000) with 0 opacity
    
    // Enable alpha blending for transparent objects
    renderer.setClearAlpha(0);
    renderer.autoClear = false;    

    let controls;
    if (isMobile) {
      controls = new DeviceOrientationControls(camera, renderer.domElement);
    } else {
      controls = new OrbitControls(camera, renderer.domElement);
    }
    controlsRef.current = controls;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    function HexagonalTube({ tubeRadius, tubeThickness, tubeLength, numSides }) {
      const hexShape = new THREE.Shape();
      const angleStep = (2 * Math.PI) / numSides;
      hexShape.moveTo(tubeRadius, 0);
      for (let i = 1; i < numSides; i++) {
        const x = tubeRadius * Math.cos(i * angleStep);
        const y = tubeRadius * Math.sin(i * angleStep);
        hexShape.lineTo(x, y);
      }
      hexShape.lineTo(tubeRadius, 0);

      const extrudeSettings = {
        depth: tubeThickness,
        bevelEnabled: false,
      };

      const geometry = new THREE.ExtrudeBufferGeometry(hexShape, extrudeSettings);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }));
      
      mesh.position.set(0, 1, 0);
      mesh.rotation.x = Math.PI / 2;
      mesh.scale.z = tubeLength / tubeThickness;

      return mesh;
    }

    const generatePlane = (texture, position, rotation) => {
      const planeGeometry = new THREE.PlaneGeometry(0.5, 0.5); // Adjust the width and height as needed
      const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
      planeMesh.position.copy(position);
      planeMesh.rotation.copy(rotation);
      scene.add(planeMesh);
    };

    if (isDataLoaded) {
      console.log(roomData);

      // Add planes with image textures
      const wallTextures = [
        roomData?.wall_1_data,
        roomData?.wall_2_data,
        roomData?.wall_3_data,
        roomData?.wall_4_data,
        roomData?.wall_5_data,
        roomData?.wall_6_data,
      ];

      console.log(roomData.invisible_walls);

      if(roomData.invisible_walls){
        openCamera();
      }else{
        scene.add(hexTube);
      }

      const positions = [
        new THREE.Vector3(0, 0, -0.5),
        new THREE.Vector3(0.433, 0, -0.25),
        new THREE.Vector3(0.433, 0, 0.25),
        new THREE.Vector3(0, 0, 0.5),
        new THREE.Vector3(-0.433, 0, 0.25),
        new THREE.Vector3(-0.433, 0, -0.25),
      ];

      const rotations = [
        new THREE.Euler(0, 0, 0),
        new THREE.Euler(0, Math.PI / 1.5, 0),
        new THREE.Euler(0, Math.PI / 3, 0),
        new THREE.Euler(0, Math.PI, 0),
        new THREE.Euler(0, 2 * Math.PI / 3, 0),
        new THREE.Euler(0, 2 * Math.PI / 1.5, 0),
      ];

      wallTextures.forEach((wallTexture, index) => {
        if (wallTexture) {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(wallTexture, (texture) => {
            generatePlane(texture, positions[index], rotations[index]);
          });
        }
      });
    }

    // Function to access the user's camera feed
    function openCamera() {
      // Access the user's media devices (camera)
      navigator.mediaDevices.getUserMedia({ video: true })
          .then(function(stream) {
              var video = document.getElementById("video");
              // Set the video source as the camera feed
              video.srcObject = stream;
              video.play();
          })
          .catch(function(error) {
              console.log("Error accessing camera:", error);
          });
    }

    const hexTube = new HexagonalTube({ tubeRadius: 2, tubeThickness: 0.2, tubeLength: 2, numSides: 6 });
    
    return () => {
      renderer.dispose();
      controls.dispose();
    };
  }, [isDataLoaded, roomData]);

  function handleBack() {
    navigate('/home');
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', position: 'absolute' }}
      />
      <div style={{ top: 20, left: 20, position: 'absolute', zIndex: 10, backgroundColor: '#000000', color: '#ffffff' }} onClick={handleBack}>Home</div>
      {roomData && (
        <div style={{ height: '50px', position: 'absolute', left: '20px', top: '30px' }}>
          <h2>Room Data</h2>
          <p>ID: {roomData.id}</p>
          <p>Name: {roomData.name}</p>
          <p>Description: {roomData.description}</p>
        </div>
      )}
      <video id="video" width="640" height="480" autoplay></video>
    </>
  );
}

export default RoomPage;
