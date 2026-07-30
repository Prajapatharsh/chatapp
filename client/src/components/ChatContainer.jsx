import React from 'react'
import assets from '../assets/assets'
import { useEffect, useRef,useContext,useState } from 'react'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../context/ChatContext'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-toastify'

const ChatContainer = () => {

  const {messages,selectedUser,setSelectedUser,sendMessage,getMessages}=useContext(ChatContext)

  const {authUser,onlineUsers} =useContext(AuthContext)

    const scrollEnd = useRef()

    const [input,setInput] =useState("")

    const handleSendMessage = async(e)=>{
      e.preventDefault();
      if(input.trim() ==="") return null;

      await sendMessage({text:input.trim()})
      setInput("")
    }

    const handleSendImage = async(e)=>{
      e.preventDefault();
      const file = e.target.files[0];
      if(!file || !file.type.startsWith("image/")){
        toast.error("select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async()=>{
        await sendMessage({image:reader.result});
        e.target.value =""
      }

      reader.readAsDataURL(file)
    }

    useEffect(()=>{
      if(selectedUser){
        getMessages(selectedUser._id)
      }
    },[selectedUser])

    useEffect(()=>{
        if(scrollEnd.current && messages){
            scrollEnd.current.scrollIntoView({behavior:"smooth"})
        }
    },[messages])

  return selectedUser ?  (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* --------- header --------- */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500/80">
        <img  
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="back"
          className="md:hidden w-6 h-6 cursor-pointer opacity-80 hover:opacity-100 shrink-0"
        />
        <img 
          src={selectedUser.profilePic || selectedUser.profilepic || assets.avatar_icon} alt="Profile" 
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
        <p className="flex-1 text-base sm:text-lg text-white flex items-center gap-2 font-medium truncate">
            {selectedUser.fullName || selectedUser.fullname}
            {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0"></span>
          )}
        </p>
        <img
          src={assets.help_icon}
          alt="icon"
          className="max-md:hidden w-5 h-5 opacity-70"
        />
      </div>

       {/* --------- chat area --------- */}
       <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-16 gap-4">
        {messages.map((msg, index) => {
          const senderIdStr = typeof msg.senderId === 'object' && msg.senderId !== null && msg.senderId._id
            ? String(msg.senderId._id)
            : String(msg.senderId || '');
          const authIdStr = String(authUser?._id || authUser?.id || '');
          const isMe = Boolean(senderIdStr && authIdStr && senderIdStr === authIdStr);

          const myAvatar = authUser?.profilePic || authUser?.profilepic || assets.avatar_icon;
          const otherAvatar = selectedUser?.profilePic || selectedUser?.profilepic || assets.avatar_icon;

          return isMe ? (
            /* My Message - Right Side */
            <div key={msg._id || index} className="flex flex-row justify-end items-end gap-2 w-full">
              <div className="flex flex-col items-end max-w-[70%]">
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="chat attachment"
                    className="max-w-[230px] rounded-lg border border-gray-700 overflow-hidden mb-1 object-cover"
                  />
                ) : (
                  <p className="p-3 text-sm font-light rounded-lg break-all bg-violet-600 text-white rounded-br-none shadow-md">
                    {msg.text}
                  </p>
                )}
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>
              <img
                src={myAvatar}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-gray-600/50"
              />
            </div>
          ) : (
            /* Other User Message - Left Side */
            <div key={msg._id || index} className="flex flex-row justify-start items-end gap-2 w-full">
              <img
                src={otherAvatar}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-gray-600/50"
              />
              <div className="flex flex-col items-start max-w-[70%]">
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="chat attachment"
                    className="max-w-[230px] rounded-lg border border-gray-700 overflow-hidden mb-1 object-cover"
                  />
                ) : (
                  <p className="p-3 text-sm font-light rounded-lg break-all bg-[#282142] text-white rounded-bl-none border border-gray-600/50 shadow-md">
                    {msg.text}
                  </p>
                )}
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={scrollEnd}></div>
       </div>


       {/* --------- bottom area --------- */}

       <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-[#282142] border border-gray-600/50 rounded-full px-4">

          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm py-3 bg-transparent text-white placeholder-gray-400 border-none outline-none min-w-0"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="image" className="cursor-pointer flex items-center pl-2 shrink-0">
            <img
              src={assets.gallery_icon}
              alt="gallery"
              className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity object-contain"
            />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="send"
          className="w-7 h-7 cursor-pointer shrink-0 hover:scale-105 transition-transform"
        />
      </div>


    </div>
  ): (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="logo" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer
