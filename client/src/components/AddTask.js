import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import React, { useState, useEffect } from 'react';


export default function AddTask(props) {
  const handleChange = props.handleChange
  const handleSubmit = props.handleSubmit
  const formData = props.formData
  const EDIT = props.EDIT
  const deleteSelected = props.deleteSelected
  const data = props.data
  const complete = props.complete
  const selectedTask = props.selectedTask
  const OnEdit = props.OnEdit


  return (
    <div>
      < Form onSubmit={handleSubmit} >
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          <Form.Label>task name</Form.Label>
          <Form.Control value={formData.name} onChange={handleChange} name="name" type="name" placeholder="task name" />

        </Form.Group>
        <Button type="submit">Add Task</Button>
      </Form >
      <button className="btn btn-dark" onClick={() => OnEdit(EDIT, data, selectedTask)}>Edit Mode</button>
      <button className="btn btn-danger" onClick={deleteSelected}>Delete Task</button>
      <button className="btn btn-success" onClick={() => complete(data)}>Complete Task</button>
    </div >
  )
}