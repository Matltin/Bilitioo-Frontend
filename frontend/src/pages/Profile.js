import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

const Profile = () => {
    // State to hold all profile data from the API
    const [profile, setProfile] = useState({});
    // State to hold the list of cities for the dropdown
    const [cities, setCities] = useState([]);
    // State for the new password input
    const [password, setPassword] = useState('');
    
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }

        // Fetch both profile data and the list of cities at the same time
        const fetchData = async () => {
            try {
                const [profileResponse, citiesResponse] = await Promise.all([
                    axios.get(`${API_URL}/profile`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/city`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                
                setProfile(profileResponse.data);
                setCities(citiesResponse.data);
            } catch (error) {
                console.error('Failed to fetch data', error);
                setMessage('Could not load profile data.');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, [navigate]);

    // Handle changes in the form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevState => ({
            ...prevState,
            // Convert city_id back to a number
            [name]: name === 'city_id' ? Number(value) : value
        }));
    };

    // Handle form submission to update the profile
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('accessToken');

        try {
            // The payload only includes fields the API allows to be changed
            const payload = {
                first_name: profile.first_name,
                last_name: profile.last_name,
                national_code: profile.national_code,
                email: profile.email,
                phone_number: profile.phone_number,
                city_id: profile.city_id,
                pic_dir: profile.pic_dir,
            };
            
            // Only add the password to the payload if the user entered a new one
            if (password) {
                payload.password = password;
            }

            await axios.put(`${API_URL}/profile`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Failed to update profile. Please check your input.');
            console.error('Update profile error', error);
        }
    };

    if (isLoading) {
        return <div className="container">Loading profile...</div>;
    }

    return (
        <div className="auth-container">
            <form className="auth-form profile-form" onSubmit={handleSubmit}>
                <h2>My Profile</h2>
                {message && <p className={message.includes('successfully') ? 'success' : 'error'}>{message}</p>}
                
                {/* --- Editable Fields --- */}
                <div className="form-group">
                    <label>First Name</label>
                    <input type="text" name="first_name" value={profile.first_name || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" name="last_name" value={profile.last_name || ''} onChange={handleChange} />
                </div>
                 <div className="form-group">
                    <label>National Code</label>
                    <input type="text" name="national_code" value={profile.national_code || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={profile.email || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone_number" value={profile.phone_number || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>City</label>
                    <select name="city_id" value={profile.city_id || ''} onChange={handleChange}>
                        <option value="">Select a city</option>
                        {cities.map((city, index) => (
                            <option key={index} value={index + 1}>{city.province}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>New Password (leave blank to keep current)</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" />
                </div>

                {/* --- Read-Only Fields --- */}
                <div className="profile-readonly-section">
                    <h4>Account Information</h4>
                    <p><strong>Wallet Balance:</strong> {profile.wallet}</p>
                    <p><strong>Role:</strong> {profile.role}</p>
                    <p><strong>Email Verified:</strong> {profile.email_verified ? 'Yes' : 'No'}</p>
                    <p><strong>Phone Verified:</strong> {profile.phone_verified ? 'Yes' : 'No'}</p>
                    <p><strong>Member Since:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
                </div>

                <button type="submit" className="btn">Update Profile</button>
                <Link to="/dashboard" className="btn btn-secondary" style={{ marginTop: '10px' }}>Back to Dashboard</Link>
            </form>
        </div>
    );
};

export default Profile;