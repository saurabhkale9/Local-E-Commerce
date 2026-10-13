import React from 'react'
import {Outlet} from 'react-router'

function Authlayout() {
  return (
    <div className="min-h-screen bg-global text-textPrimary">
      <Outlet/>
    </div>
  )
}

export default Authlayout
