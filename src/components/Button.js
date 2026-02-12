import React from 'react'
import '../styles/Components.css'

const Button = ({ children, type, onChange, onClick, ...rest }) => {
  return (
    <button className={`btn-com btn-com-${type}`} onClick={onClick || onChange} {...rest}>
      {children}
    </button>
  )
}

export default Button
