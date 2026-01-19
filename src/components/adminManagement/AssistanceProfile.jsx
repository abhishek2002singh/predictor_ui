import React from 'react'
import assistantService from "../../services/assistantService";
import { useParams } from 'react-router-dom';

const AssistanceProfile = () => {
    const {id} = useParams()
    
  return (
    <div>
        <h1>your is is this {id}</h1>
    </div>
  )
}

export default AssistanceProfile