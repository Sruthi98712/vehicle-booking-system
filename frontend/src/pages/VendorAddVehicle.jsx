import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { 
    Plus, 
    MapPin, 
    Upload, 
    Truck, 
    Car, 
    Bike as BikeIcon, 
    Settings, 
    Check, 
    X,
    Tractor,
    Bus,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = { width: '100%', height: '400px' };
const center = { lat: 16.5062, lng: 80.6480 };

const vehicleTypes = [
    { id: 'car', label: 'Car', icon: Car },
    { id: 'bike', label: 'Bike', icon: BikeIcon },
    { id: 'auto', label: 'Auto', icon: Car },
    { id: 'van', label: 'Van', icon: Truck },
    { id: 'truck', label: 'Truck', icon: Truck },
    { id: 'tractor', label: 'Tractor', icon: Tractor },
    { id: 'bus', label: 'Bus', icon: Bus },
    { id: 'cycle', label: 'Cycle', icon: BikeIcon }
];

const VendorAddVehicle = () => {
    const navigate = useNavigate();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSy..." // Placeholder, should use env
    });

    const [form, setForm] = useState({
        make: '',
        model: '',
        vehicleType: 'car',
        pricePerDay: '',
        description: '',
        availability: 'available',
        location: { latitude: 16.5062, longitude: 80.6480 },
        images: []
    });

    const [submitting, setSubmitting] = useState(false);
    const [marker, setMarker] = useState(center);

    const onMapClick = (e) => {
        const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarker(newPos);
        setForm({ ...form, location: { latitude: newPos.lat, longitude: newPos.lng } });
    };

    const handleFileChange = (e) => {
        // Mocking image upload for now
        setForm({ ...form, images: ['https://source.unsplash.com/featured/?vehicle'] });
        toast.info("Image mock uploaded!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/v1/vendor/vehicles/add', {
                ...form,
                rentalPricePerDay: Number(form.pricePerDay),
                available: form.availability === 'available',
                year: 2024, // Default year if not provided
                licensePlate: `AP-${Math.floor(Math.random()*100)}-${Math.floor(Math.random()*10000)}` // Dummy license plate
            });
            toast.success('Vehicle added successfully!');
            navigate('/vendor/vehicles');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error adding vehicle');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">ADD NEW VEHICLE</h1>
                    <p className="text-slate-500 font-medium">Expand your rental fleet and reach more customers.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Fields */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Make</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Toyota"
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 font-bold"
                                        value={form.make}
                                        onChange={(e) => setForm({...form, make: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Model</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Innova"
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 font-bold"
                                        value={form.model}
                                        onChange={(e) => setForm({...form, model: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Price Per Day (₹)</label>
                                    <input 
                                        type="number" 
                                        placeholder="2500"
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 font-bold"
                                        value={form.pricePerDay}
                                        onChange={(e) => setForm({...form, pricePerDay: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Availability</label>
                                    <select 
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 font-bold appearance-none capitalize"
                                        value={form.availability}
                                        onChange={(e) => setForm({...form, availability: e.target.value})}
                                    >
                                        <option value="available">Available</option>
                                        <option value="unavailable">Maintenance</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                <textarea 
                                    rows="4"
                                    placeholder="Briefly describe the vehicle's features and condition..."
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 font-bold"
                                    value={form.description}
                                    onChange={(e) => setForm({...form, description: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Set Vehicle Location</label>
                        <div className="rounded-2xl overflow-hidden border border-slate-100">
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={center}
                                    zoom={14}
                                    onClick={onMapClick}
                                    options={{
                                        disableDefaultUI: true,
                                        zoomControl: true,
                                        styles: [
                                            {
                                                "featureType": "all",
                                                "elementType": "geometry.fill",
                                                "stylers": [{"weight": "2.00"}]
                                            }
                                        ]
                                    }}
                                >
                                    <Marker position={marker} draggable={true} onDragEnd={(e) => onMapClick(e)} />
                                </GoogleMap>
                            ) : (
                                <div className="h-[400px] flex items-center justify-center bg-slate-100">
                                    <Loader2 className="animate-spin text-slate-400" />
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-3 italic flex items-center gap-1">
                            <MapPin size={10} /> Click or drag marker to set precise pickup location.
                        </p>
                    </div>
                </div>

                {/* Right Column: Type and Images */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Select Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {vehicleTypes.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setForm({...form, vehicleType: type.id})}
                                    className={`
                                        flex flex-col items-center justify-center p-4 rounded-2xl transition-all border-2
                                        ${form.vehicleType === type.id 
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105' 
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}
                                    `}
                                >
                                    <type.icon size={24} className="mb-2" />
                                    <span className="text-[10px] font-black uppercase">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Vehicle Images</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => document.getElementById('imageInput').click()}>
                            <Upload className="text-slate-300 mb-2" size={32} />
                            <span className="text-xs font-bold text-slate-500 text-center">Click to upload images</span>
                            <input id="imageInput" type="file" className="hidden" onChange={handleFileChange} />
                        </div>
                        {form.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 gap-2">
                                <img src={form.images[0]} className="w-full h-32 object-cover rounded-xl" alt="Preview" />
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
                        ADD VEHICLE
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VendorAddVehicle;
