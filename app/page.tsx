'use client';

import Image from "next/image";
import Link from "next/link";

import { useState, useEffect } from "react"

export default function Home() {

  var created_link = ''

  const [web, setWeb] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const submitData = { web }
    const petition = "/api/url?url=" + web

    try {
      const res = await fetch(petition, {
        method: 'POST',
        body: JSON.stringify(submitData),
        headers: {
          'content-type': 'application/json'
        }
      })
      console.log(res)
      if (res.ok) {
        created_link = await res.json()
        console.log(created_link)
        document.getElementById("created_link_section").style.display = "block";
        document.getElementById("created_link").innerHTML = window.location.origin + "/api/" + created_link;
      } else {
        console.log("Oops! Something is wrong.")
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className=" flex flex-col justify-center items-center w-full p-80 ">
        <h1 className=" w-full text-center m-4 font-semibold text-lg ">Website Url Shortener</h1>
        <form className=" flex w-full flex-col justify-center items-center " onSubmit={handleSubmit}>
          <div className=" flex w-1/2 justify-center items-center gap-4 ">
            <input
              type="text"
              name="url"
              placeholder="Enter the url"
              onChange={e => setWeb(e.target.value)}
              className=" border p-2 px-4 rounded text-black outline-none "
            />
            <button
              type="submit"
              className=" border-blue-500 bg-blue-500 text-white p-2 px-4 rounded-md "
            >Shorten</button>
          </div>
        </form>
        <div id='created_link_section' className="bg-white border-t border-b border-blue-500 text-blue-700 px-4 py-3" role="alert" style={{ display: 'none' }}>
          <p className="font-bold">Your shortened url is:</p>
          <p id='created_link' className="text-sm"></p>
        </div>
      </div>
    </main>
  );
}
