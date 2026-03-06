import React, { useState } from 'react'
import { CloseIcon } from '../icons/CloseIcon'
import Button from './Button'


//controlled Component
function CreateContentModal({ open, onClose }) {

    return (
        <div>
            {open && <div className='w-screen h-screen bg-slate-500 opacity-70 fixed top-0 left-0 flex justify-center'>
                <div className='flex flex-col justify-center'>
                    <span className='bg-white opacity-100 p-4 rounded-md'>
                        <div className='flex justify-end cursor-pointer'>
                            <div onClick={onClose}>
                                <CloseIcon />
                            </div>
                        </div>
                        <div>
                            <Input placeHolder={"Enter Title"} />
                            <Input placeHolder={"Enter Link"} />

                        </div>
                        <div className='flex justify-center'>
                            <Button variant='primary' text='Submit' />
                        </div>
                    </span>
                </div> </div>}

        </div>
    )
}

export default CreateContentModal



function Input({ onChange, placeHolder }: { onChange: () => void }) {
    return <div>
        <input placeholder={placeHolder} type='text' className='px-4 py-2 border-0 m-2' onChange={onChange}></input>
    </div>
}