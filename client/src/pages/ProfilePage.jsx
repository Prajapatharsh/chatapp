import React, { useState, useContext, useEffect } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext)

  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser?.fullName || authUser?.fullname || '')
  const [bio, setBio] = useState(authUser?.bio || '')

  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || authUser.fullname || '')
      setBio(authUser.bio || '')
    }
  }, [authUser])

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImg) {
      await updateProfile({
        fullName: name,
        bio: bio,
      });

      navigate("/");
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(selectedImg);

    reader.onload = async () => {
      const base64Image = reader.result;

      await updateProfile({
        profilePic: base64Image,
        fullName: name,
        bio: bio,
      });

      navigate("/");
    };
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center p-3 sm:p-6">
      <div className="w-full sm:w-11/12 md:w-5/6 max-w-2xl bg-[#282142]/90 backdrop-blur-2xl text-white border border-gray-600/60 flex items-center justify-between max-sm:flex-col-reverse rounded-xl shadow-2xl p-3 sm:p-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-8 flex-1 w-full"
        >
          <h3 className="text-xl font-medium text-white">Profile details</h3>
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer text-gray-300 hover:text-white transition-colors"
          >
            <input  
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img 
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : (authUser?.profilePic || authUser?.profilepic || assets.avatar_icon)
              }
              alt="profile"
              className="w-12 h-12 object-cover rounded-full border border-gray-500 shrink-0"
            />
            <span className="text-sm sm:text-base">upload profile image</span>
          </label>

          <input 
            required
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 bg-[#18152e] text-white placeholder-gray-400 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm sm:text-base"
          />
          <textarea 
            required
            placeholder="Your Bio"
            value={bio}
            rows={4}
            onChange={(e) => setBio(e.target.value)}
            className="p-3 bg-[#18152e] text-white placeholder-gray-400 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-sm sm:text-base"
          >
          </textarea>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-3 rounded-full text-base sm:text-lg font-medium cursor-pointer hover:opacity-90 transition-opacity mt-2"
          >
            Save
          </button>
        </form>
        <img
          className="max-w-32 sm:max-w-44 aspect-square rounded-full mx-auto sm:mx-10 max-sm:mt-6 object-cover border-2 border-violet-500/50 shadow-lg"
          src={selectedImg ? URL.createObjectURL(selectedImg) : (authUser?.profilePic || authUser?.profilepic || assets.logo_icon)}
          alt="logo"
        />
      </div>
    </div>
  )

}


export default ProfilePage
