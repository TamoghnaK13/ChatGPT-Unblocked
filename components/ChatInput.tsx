'use client'

import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { db } from "../firebase";

type Props =  {
  chatId: string;
}


function ChatInput({chatId}: Props) {

  const[prompt, setPrompt] = useState("")
  const {data: session} = useSession()
  
  // useSWR to get model 
  const model = 'tex-davinci-003'


  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(!prompt) return

    const input = prompt.trim()
    setPrompt("")

    const message : Message = {
      text: input,
      createdAt: serverTimestamp(),
      user: {
        _id: session?.user?.email!,
        name: session?.user?.name!,
        avatar: session?.user?.image! || `https://ui-avatars.com/api/?name=${session?.user?.name}`
      }
    }
    //adding messages to collection
    await addDoc(
      collection(db, 'users', session?.user?.email!, 'chats', chatId, 'messages'), 
      message
    )
// toast notification to say loading
    const notification = toast.loading('ChatGPT is thinking...');


    await fetch('/api/askQuestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: input, chatId, model, session
      })
    } 
    ).then(()=> {
      // toast notification to say successful 
      toast.success('ChatGPT has responded!', {id: notification})
    })

  }

  return (
    <div className="bg-gray-700/50 text-gray-400 rounded-lg text-sm" >
      <form  onSubmit={sendMessage} className="p-5 space-x-5 flex" >
    <input 
    className="bg-transparent focus:outline-none flex-1 disabled:cursor-not-allowed  disabled:text-gray-300"
    disabled={!session}
    value={prompt}
    onChange={(e) => setPrompt(e.target.value)}
    type="text" 
    placeholder="Type your message here...." 
    />

    <button 
    disabled={!prompt || !session}
    className="bg-[#11a37f] hover:opacity-50 text-white font-bold px-4 py-2 rounded disabled:text-gray-300 disabled:cursor-not-allowed"
    type="submit" >
      <PaperAirplaneIcon className="h-4 2-4 -rotate-45" />
    </button>
      </form>

      <div>
        {/* modal selection  */}
      </div>
    </div>
  )
}

export default ChatInput