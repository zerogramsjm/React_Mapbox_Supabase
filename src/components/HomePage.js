import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import { FiLogOut } from 'react-icons/fi';

import * as turf from '@turf/turf';

import mapone from './images/mapone.png';

mapboxgl.accessToken = 'pk.eyJ1IjoiamV2b25tYWhvbmV5IiwiYSI6ImNrbjRpOThhbzBsOTkycm5xYjVodGlhZnoifQ.nUA78X2hM4qVWn-xD8l3lw';

function HomePage() {
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [wallNumber, setWallNumber] = useState(0);

  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [isTextLocked, setIsTextLocked] = useState(false);
  const [isImageLocked, setIsImageLocked] = useState(false);
  const [isAudioLocked, setIsAudioLocked] = useState(false);

  const [invisibleWalls, setInvisibleWalls] = useState(false);

  const [dfm1, setDfm1] = useState('');
  const [dfm2, setDfm2] = useState('');
  const [dfm3, setDfm3] = useState('');
  const [dfm4, setDfm4] = useState('');
  const [dfm5, setDfm5] = useState('');
  const [dfm6, setDfm6] = useState('');

  useEffect(() => {
    const getuser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        navigate('/')
      }
      console.log(user)
    }
    getuser();
  }, []);

  useEffect(() => {
    if (mapRef.current) return; // map already initialized

    // Create a new map instance
    const map = new mapboxgl.Map({
      container: mapContainerRef.current, // Specify the container ID
      style: 'mapbox://styles/jevonmahoney/ckn4jdeho1rij17qeg7er8bln', // Specify the map style
      center: [-0.537751, 53.236861], // Specify the starting point
      zoom: 15 // Specify the zoom level
    });

    // Save the map instance to the ref
    mapRef.current = map;

    // Add click event listener to the map
    map.on('click', function (e) {
      setClickedLocation([e.lngLat.lng, e.lngLat.lat]);
      setModalOpen(true);
    });

    map.on('load', () => {
      loadRoomsAndMarkers(map);

      map.addSource('radar', {
        'type': 'image',
        'url': mapone,
        'coordinates': [
          [-0.5706, 53.2691],
          [-0.4536, 53.2691],
          [-0.4536, 53.1962],
          [-0.5706, 53.1962]
        ]
      });

    });

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      })
    )

  }, []);

  function handleLogout() {
    supabase.auth.signOut();
    navigate('/');
  }

  function closeRoomModal() {
    setModalOpen(false);
  }

  async function handleSubmit() {
    // Get current user ID and email address
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user.id;
    const userEmail = user.email;

    console.log(dfm1)
  
    if (name === "") {
      alert("You need to supply a name");
    } else {
      if (description === "") {
        alert("You need to supply a description");
      } else {
        // Generate a random UID
        const uid = Math.random().toString(36).substr(2, 12);
  
        const roomData = {
          uid,
          name,
          description,
          longitude: clickedLocation[0],
          latitude: clickedLocation[1],
          user_id: userId,
          user_email: userEmail,
          wall_1_data: dfm1,
          wall_2_data: dfm2,
          wall_3_data: dfm3,
          wall_4_data: dfm4,
          wall_5_data: dfm5,
          wall_6_data: dfm6,
          invisible_walls: invisibleWalls, // Add the "invisibleWalls" value
        };
  
        // Insert new room into 'rooms' table in Supabase
        const { data, error } = await supabase.from('rooms').insert([roomData], { returning: 'minimal' });

        if (error) {
          console.log('Error inserting room:', error.message);
        } else {
          console.log('Room inserted successfully:', data);
          alert("Room created successfully");
          closeRoomModal();
        }
      }
    }
  } 

  async function loadRoomsAndMarkers(map) {
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) {
      console.log('Error fetching rooms:', error.message);
    } else {
      // Add markers for each room
      data.forEach(room => {
        const marker = new mapboxgl.Marker()
          .setLngLat([room.longitude, room.latitude])
          .addTo(map);

        // Add click event listener to marker
        marker.getElement().addEventListener('click', (e) => {
          e.stopPropagation();
          showMarkerDetails(map, marker, room);
        });
        distanceToMarker(map, marker, room);
      });
    }
  }

  function showMarkerDetails(map, marker, room) {
    const popup = new mapboxgl.Popup({
      closeOnClick: true
    }).setHTML(`
      <div style="background-color: white; border-radius: 8px; box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2); padding: 16px;">
        <h3 style="margin-bottom: 8px;">${room.name}</h3>
        <p style="margin-bottom: 4px;">${room.description}</p>
      </div>
    `);
    marker.setPopup(popup);
    popup.addTo(map);
  }

  function distanceToMarker(map, marker, room) {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const userLocation = {
          lng: position.coords.longitude,
          lat: position.coords.latitude
        };

        // Calculate distance between user's location and marker
        const markerLocation = turf.point([room.longitude, room.latitude]);
        const distance = turf.distance(
          turf.point([userLocation.lng, userLocation.lat]),
          markerLocation,
          { units: 'meters' }
        );
        
        if (distance <= 100) { // If distance is less than or equal to 10km
          // Open modal with room details
          const name = `
              ${room.name}
          `;
          const longitude = `
              ${room.longitude}
          `;
          const latitude = `
              ${room.latitude}
          `;
          const uid = `
              ${room.uid}
          `;
          openModal(name, longitude, latitude, uid);
        }
      })
    }
    // setTimeout(function(){
    //   distanceToMarker(map, marker, room)
    // },5000)
  }

  function openModal(name, longitude, latitude, uid) {
    const modal = document.createElement('div');
    modal.style.position = 'absolute';
    modal.style.top = '0px';
    modal.style.height = '100%';
    modal.style.right = '0px';
    modal.style.color = 'white';
    modal.style.backgroundColor = 'blue';
    modal.style.padding = '20px';

    const latP = document.createElement('p');
    latP.innerText = `Latitude: ${latitude}`;
    modal.appendChild(latP);

    const longP = document.createElement('p');
    longP.innerText = `Longitude: ${longitude}`;
    modal.appendChild(longP);

    const nameLabel = document.createElement('label');
    nameLabel.innerText = 'Name:';
    const nameInput = document.createElement('label');
    nameInput.innerText = name;
    modal.appendChild(nameLabel);
    modal.appendChild(nameInput);

    const nameButton = document.createElement('button');
    nameButton.innerText = "Open Room";
    nameButton.addEventListener('click', () => {
      openRoom(uid);
    });
    modal.appendChild(nameButton);

    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.addEventListener('click', closeThisModal);
    modal.appendChild(closeButton);

    function closeThisModal() {
      modal.remove();
    }

    document.body.appendChild(modal);
  }

  function openRoom(uid) {
    uid = String(uid).replace(/\s/g, '');
    navigate(`/room?${uid}`);
  }

  function add_wall_content(wall_number) {
    open_sub_room_modal(wall_number);
  }

  function open_sub_room_modal(wall_number) {
    setWallNumber(wall_number);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    resetInputs();
  }

  function renderModal() {
    const buttonStyle = {
      display: 'block',
      width: '100%',
      marginBottom: '10px',
      marginTop: '10px',
      padding: '8px',
      backgroundColor: 'blue',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    };

    return (
      <div style={{ position: 'absolute', top: 40, left: 0, height: '100%', zIndex: -1, backgroundColor: 'red', padding: 10 }}>
        <p>Latitude: {clickedLocation[1]}</p>
        <p>Longitude: {clickedLocation[0]}</p>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} /><br />
        <label htmlFor="description">Description:</label>
        <input type="text" id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} /><br />

        <button style={buttonStyle} onClick={() => add_wall_content(1)}>Wall 1</button>
        <button style={buttonStyle} onClick={() => add_wall_content(2)}>Wall 2</button>
        <button style={buttonStyle} onClick={() => add_wall_content(3)}>Wall 3</button>
        <button style={buttonStyle} onClick={() => add_wall_content(4)}>Wall 4</button>
        <button style={buttonStyle} onClick={() => add_wall_content(5)}>Wall 5</button>
        <button style={buttonStyle} onClick={() => add_wall_content(6)}>Wall 6</button>
        
        <input
          type="checkbox"
          id="invisibleWallsToggle"
          checked={invisibleWalls}
          onChange={(e) => setInvisibleWalls(e.target.checked)}
        />
        <label htmlFor="invisibleWallsToggle">Invisible Walls</label>

        <button style={buttonStyle} onClick={handleSubmit}>Submit</button>
        <button style={buttonStyle} onClick={closeRoomModal}>Close</button>
      </div>
    );
  }

  function handleSubmitModal() {
    let base64Image, text;
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        base64Image = reader.result;
        if (wallNumber === 1) {
          setDfm1(base64Image);
        }
        if(wallNumber==2){
          setDfm2(base64Image);
        }
        if(wallNumber==3){
          setDfm3(base64Image);
        }
        if(wallNumber==4){
          setDfm4(base64Image);
        }
        if(wallNumber==5){
          setDfm5(base64Image);
        }
        if(wallNumber==6){
          setDfm6(base64Image);
        }
        close_and_reset();
      };
      reader.readAsDataURL(image);
    }
    else{
      if(wallNumber==1){
        setDfm1(text);
      }
      if(wallNumber==2){
        setDfm2(text);
      }
      if(wallNumber==3){
        setDfm3(text);
      }
      if(wallNumber==4){
        setDfm4(text);
      }
      if(wallNumber==5){
        setDfm5(text);
      }
      if(wallNumber==6){
        setDfm6(text);
      }
      close_and_reset();
    }

    function close_and_reset(){
      setText('');
      setImage(null);
      setAudio(null);
      closeModal();
    }

  }

  const resetInputs = () => {
    setText('');
    setImage(null);
    setAudio(null);
    setIsTextLocked(false);
    setIsImageLocked(false);
    setIsAudioLocked(false);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    setIsImageLocked(e.target.value !== '');
    setIsAudioLocked(e.target.value !== '');
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setIsTextLocked(e.target.files[0] !== null);
    setIsAudioLocked(e.target.files[0] !== null);
  };

  const handleAudioChange = (e) => {
    setAudio(e.target.files[0]);
    setIsTextLocked(e.target.files[0] !== null);
    setIsImageLocked(e.target.files[0] !== null);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setIsTextLocked(false);
    setIsAudioLocked(false);
  };

  const handleRemoveAudio = () => {
    setAudio(null);
    setIsTextLocked(false);
    setIsImageLocked(false);
  };

  return (
    <div style={{ zIndex: -1 }}>
      <p style={{ top: -10, left: 40, position: 'absolute' }}>Welcome, {user?.email}!</p>
      <div style={{ top: 10, left: 10, position: 'absolute' }} onClick={handleLogout}>
        <FiLogOut />
      </div>
      <div ref={mapContainerRef} style={{ height: '750px', width: '100%', position: 'absolute', top: 40, zIndex: -2 }}></div>

      {modalOpen && renderModal()}

      {showModal && (
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: 20, zIndex: 9999 }}>
        <h1>Modal Content</h1>
        <p>Wall Number: {wallNumber}</p>

        {/* Text Input */}
        <label htmlFor="text">Text:</label>
        <input type="text" id="text" name="text" value={text} onChange={handleTextChange} disabled={isTextLocked} />

        {/* Image Input */}
        <label htmlFor="image">Image:</label>
        <input type="file" accept="image/*" id="image" name="image" onChange={handleImageChange} disabled={isImageLocked} />
        {image && (
          <button onClick={handleRemoveImage}>Remove Image</button>
        )}

        {/* Audio Input */}
        <label htmlFor="audio">Audio:</label>
        <input type="file" accept="audio/*" id="audio" name="audio" onChange={handleAudioChange} disabled={isAudioLocked} />
        {audio && (
          <button onClick={handleRemoveAudio}>Remove Audio</button>
        )}

        <button onClick={handleSubmitModal}>Submit</button>
        <button onClick={closeModal}>Close</button>
      </div>
    )}

    </div>
  );
}

export default HomePage;
