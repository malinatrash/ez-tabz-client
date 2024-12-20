'use client'

import React, { useState, useCallback, useRef, FC } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { useProjectState } from '@/hooks/useProjectState'
import { useWebSocket } from '@/hooks/useWebSocket'

interface ProjectPageProps {
  params: {
    id: string
  }
}

const ProjectPage: FC<ProjectPageProps> = (props: ProjectPageProps) => {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const { 
    projectState, 
    updateProjectStateField 
  } = useProjectState(props.params.id)

  const handleWebSocketMessage = useCallback((message: string) => {
    try {
      const parsedMessage = JSON.parse(message)
      if (parsedMessage && typeof parsedMessage === 'object' && 'state' in parsedMessage) {
        updateProjectStateField('state', parsedMessage.state)
      }
    } catch (error) {
      updateProjectStateField('state', message)
    }
  }, [updateProjectStateField])

  const projectId = props.params.id;
  const { sendMessage } = useWebSocket(`ws://localhost:8001/projects/${projectId}/ws`,  handleWebSocketMessage)

  const handleStateChange = (newValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      sendMessage(newValue)
    }, 100)

    updateProjectStateField('state', newValue)
  }

  if (!projectState) return <div>Загрузка...</div>

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Состояние проекта: {projectState.name}</h2>
        <div className="space-y-4">
          <div>
            <strong>ID проекта:</strong> {projectState.id}
          </div>
          <div>
            <strong>Статус:</strong>{' '}
            <span 
              className={`px-2 py-1 rounded ${
                projectState.private 
                  ? 'bg-red-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}
            >
              {projectState.private ? 'Приватный' : 'Публичный'}
            </span>
          </div>
          <div>
            <strong>Состояние проекта:</strong>
            <Textarea 
              value={projectState.state || ''} 
              onChange={(e) => handleStateChange(e.target.value)}
              placeholder="Введите состояние проекта"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectPage