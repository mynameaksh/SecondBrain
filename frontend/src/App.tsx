import { useState } from "react"
import Button from "./components/Button"
import Card from "./components/Card"
import CreateContentModal from "./components/CreateContentModal"
import { PlusIcon } from "./icons/PlusIcon"
import { ShareIcon } from "./icons/ShareIcon"
import Sidebar from "./components/Sidebar"


function App() {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <div>
      <Sidebar />
      <div className="p-4 ml-72 min-h-screen bg-[#eeeeef]">
        <CreateContentModal open={modalOpen} onClose={() => {
          setModalOpen(!modalOpen)
        }} />
        <div className="flex justify-end gap-4">
          <Button onClick={() => {
            setModalOpen(true)
          }} variant="primary" text="Add Content" startIcon={<PlusIcon />} />

          <Button variant="secondary" text="Share Brain" startIcon={<ShareIcon />} />
        </div>
        <div className="flex m-3 gap-3">
          <Card title="HIShreya" type="twitter" link="https://x.com/Oblivious9021/status/2025903220753883232" />
          <Card title="Bitch" type="youtube" link="https://www.youtube.com/watch?v=3Trg5u5_Igs" />
        </div>
      </div>
    </div>
  )
}

export default App
