import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationPicker({ setAddress, setMarkerPos }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPos([lat, lng]);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        const addr = data.address || {};

        const locationObj = {
          road: addr.road || "",
          house_number: addr.house_number || "",
          neighbourhood: addr.neighbourhood || "",
          city: addr.city || addr.town || addr.village || "",
          state: addr.state || "",
          country: addr.country || "",
          postcode: addr.postcode || "",
        };

        setAddress(locationObj);
      } catch (err) {
        console.error("Reverse geocoding error:", err);
        setAddress(null);
      }
    },
  });
  return null;
}

function Info() {
  const [currentModel, setCurrentModel] = useState("Form");
  const [userDetails, setUserDetails] = useState({
    userName: "",
    phone: "",
    address: {
      road: "",
      house_number: "",
      neighbourhood: "",
      city: "",
      state: "",
      country: "",
      postcode: "",
    },
  });
  const [markerPos, setMarkerPos] = useState(null);

  const handleChangeActive = (value) => setCurrentModel(value);
  const handleUserDetails = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddressSelect = (locationObj) => {
    setUserDetails((prev) => ({ ...prev, address: locationObj }));
  };

  const { address } = userDetails;

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-linear-to-tr from-amber-200 via-amber-100 to-amber-200 caret-transparent">
      <div className="bg-amber-800 h-[60%] w-[20%] rounded-tl-3xl rounded-bl-3xl flex flex-col justify-center gap-6 p-8 shadow-2xl">
        <ul className="text-white font-semibold text-lg space-y-4">
          {["Form", "Address", "Info"].map((item) => (
            <li
              key={item}
              className={`cursor-pointer relative py-2 px-4 rounded hover:bg-amber-700 transition-all ${
                currentModel === item
                  ? "bg-amber-700  decoration-white decoration-2"
                  : ""
              }`}
              onClick={() => handleChangeActive(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className=" h-[60%] w-[50%] rounded-tr-3xl rounded-br-3xl overflow-hidden shadow-xl relative flex flex-col">
        {currentModel === "Info" ? (
          <div className="p-6 flex flex-col gap-4 h-full justify-center bg-[#FFE797] rounded-tr-3xl rounded-br-3xl shadow-inner">
            <h1 className="text-2xl font-bold text-amber-800">User Details</h1>
            <p className="text-gray-700">
              Name: {userDetails.userName || "Not entered"}
            </p>
            <p className="text-gray-700">
              Phone: {userDetails.phone || "Not entered"}
            </p>
            <p className="text-gray-700">
              City: {address.city || "Not entered"}
            </p>
            <p className="text-gray-700">
              State: {address.state || "Not entered"}
            </p>
            <p className="text-gray-700">
              Country: {address.country || "Not entered"}
            </p>
            <p className="text-gray-700">
              Postcode: {address.postcode || "Not entered"}
            </p>
          </div>
        ) : currentModel === "Address" ? (
          <div className="h-full w-full shadow-md rounded-tr-3xl rounded-br-3xl overflow-hidden">
            <MapContainer
              center={[28.20883485213087, 83.98121383675318]}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker
                setAddress={handleAddressSelect}
                setMarkerPos={setMarkerPos}
              />
              {markerPos && (
                <Marker position={markerPos}>
                  <Popup>
                    {address.road}, {address.city}, {address.country}
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full p-6 gap-4 bg-[#FFE797] rounded-tr-3xl rounded-br-3xl shadow-inner">
            <h1 className="text-2xl font-bold text-amber-800">Enter Details</h1>
            <form className="flex flex-col gap-3 w-full">
              <input
                type="text"
                name="userName"
                value={userDetails.userName}
                onChange={handleUserDetails}
                placeholder="Name"
                className="border border-black p-2 rounded-md focus:ring-2 focus:ring-amber-400 placeholder-gray-400 placeholder-opacity-60 transition-all caret-black"
              />
              <input
                type="text"
                name="phone"
                value={userDetails.phone}
                onChange={handleUserDetails}
                placeholder="Phone"
                className="border border-black p-2 rounded-md focus:ring-2 focus:ring-amber-400 placeholder-gray-400 placeholder-opacity-60 transition-all caret-black"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Info;
