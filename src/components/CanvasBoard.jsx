import { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Line, Text } from 'react-konva'

const CanvasBoard = ({ 
  width = 600, 
  height = 400, 
  tool = 'pen', 
  strokeColor = '#000000', 
  strokeWidth = 2,
  onSignatureChange,
  textSignatures = [],
  onAddTextSignature
}) => {
  const [lines, setLines] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const stageRef = useRef()

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ lines: [...lines], textSignatures: [...textSignatures] })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleMouseDown = (e) => {
    if (tool !== 'pen') return
    
    setIsDrawing(true)
    const pos = e.target.getStage().getPointerPosition()
    const newLine = {
      id: Date.now(),
      points: [pos.x, pos.y],
      stroke: strokeColor,
      strokeWidth: strokeWidth,
    }
    setLines([...lines, newLine])
  }

  const handleMouseMove = (e) => {
    if (!isDrawing || tool !== 'pen') return

    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    const lastLine = lines[lines.length - 1]
    
    if (lastLine) {
      const newPoints = lastLine.points.concat([point.x, point.y])
      const updatedLines = [...lines]
      updatedLines[updatedLines.length - 1] = {
        ...lastLine,
        points: newPoints,
      }
      setLines(updatedLines)
    }
  }

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveToHistory()
      onSignatureChange && onSignatureChange()
    }
  }

  const handleStageClick = (e) => {
    if (tool === 'text') {
      const pos = e.target.getStage().getPointerPosition()
      onAddTextSignature && onAddTextSignature(pos.x, pos.y)
    }
  }

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setLines(prevState.lines)
      setHistoryIndex(historyIndex - 1)
      onSignatureChange && onSignatureChange()
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setLines(nextState.lines)
      setHistoryIndex(historyIndex + 1)
      onSignatureChange && onSignatureChange()
    }
  }

  const clear = () => {
    setLines([])
    saveToHistory()
    onSignatureChange && onSignatureChange()
  }

  const exportAsImage = () => {
    const stage = stageRef.current
    if (stage) {
      return stage.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2
      })
    }
    return null
  }

  const exportAsBlob = () => {
    const stage = stageRef.current
    if (stage) {
      return new Promise((resolve) => {
        stage.toCanvas().toBlob(resolve, 'image/png', 1)
      })
    }
    return null
  }

  // Expose methods to parent component
  useEffect(() => {
    const actions = {
      undo,
      redo,
      clear,
      exportAsImage,
      exportAsBlob,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1,
      isEmpty: lines.length === 0 && textSignatures.length === 0
    }
    
    if (onSignatureChange) {
      onSignatureChange(actions)
    }
  }, [lines, textSignatures, historyIndex, history, onSignatureChange])

  return (
    <div className="signature-canvas border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onClick={handleStageClick}
      >
        <Layer>
          {/* Draw lines */}
          {lines.map((line) => (
            <Line
              key={line.id}
              points={line.points}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation="source-over"
            />
          ))}
          
          {/* Draw text signatures */}
          {textSignatures.map((textSig, index) => (
            <Text
              key={`text-${index}`}
              x={textSig.x}
              y={textSig.y}
              text={textSig.text}
              fontSize={textSig.fontSize || 24}
              fontFamily={textSig.fontFamily || 'Dancing Script'}
              fill={textSig.color || strokeColor}
              draggable={false}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  )
}

export default CanvasBoard