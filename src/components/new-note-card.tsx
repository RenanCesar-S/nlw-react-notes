import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface NewNoteCardProps {
    onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
    const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
    const [isRecording, setIsRecording] = useState(false)
    const [content, setContent] = useState('')

    function handleStartEditor() {
        setShouldShowOnboarding(false)
    }

    function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
        let handleTextArea = event.target.value;
        
        setContent(handleTextArea)
        
        if (handleTextArea == "") {
            setShouldShowOnboarding(true)
        }
    }

    function handleSaveNote(event: FormEvent) {
        event.preventDefault()

        if(content === '') {
            return
        }
        
        onNoteCreated(content)

        setContent('')
        setShouldShowOnboarding(true)

        toast.success('Nota criada com sucesso!')
    }

    function handleStartRecording() {
        const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

        if(!isSpeechRecognitionAPIAvailable) {
            alert('Infelizmente seu navegador não suporta o componente de gravação!')
            return
        }

        setIsRecording(true)
        setShouldShowOnboarding(false)

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

        speechRecognition = new SpeechRecognitionAPI()

        speechRecognition.lang = 'pt-BR'
        speechRecognition.continuous = true
        speechRecognition.maxAlternatives = 0
        speechRecognition.interimResults = true

        speechRecognition.onresult = (event) => {
            const transcription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript)
            }, '')

            setContent(transcription)
        }

        speechRecognition.onerror = (event) => {
            console.error(event)
        }

        speechRecognition.start()
    }

    function handleStopRecording() {
        setIsRecording(false)

        if(speechRecognition !== null) {
            speechRecognition.stop()
        }
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
                <span className="text-sm font-medium text-slate-200">
                    Adicionar nota
                </span>
                <p className="text-sm leading-6 text-slate-400">
                    Grave uma nota em áudio que será convertida para texto automaticamente.
                </p>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="inset-0 fixed bg-black/50" />
                <Dialog.Content className="fixed overflow-hidden inset-auto left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md md:max-w-[640px] w-full h-[80vh] md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
                    <Dialog.Close className="absolute top-0 right-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:text-slate-100">
                        <X className="size-5" />
                    </Dialog.Close>
                    
                    <form className="flex flex-1 flex-col">
                    
                        <div className="flex flex-1 flex-col gap-3 p-5">
                            <span className="text-sm font-medium text-slate-300">
                                Adicionar nota
                            </span>
                            {shouldShowOnboarding ? (
                                <p className="text-sm leading-6 text-slate-400">
                                Comece <button type='button' onClick={handleStartRecording} className="text-lime-400 font-medium outline-none hover:underline focus-visible:text-lime-400 focus-visible:underline">gravando uma nota</button> em áudio ou se preferir <button type='button' onClick={ handleStartEditor } className="text-lime-400 font-medium outline-none hover:underline focus-visible:text-lime-400 focus-visible:underline">utilize apenas texto</button>.
                                </p>
                            ) : (
                                <textarea
                                autoFocus
                                className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none" 
                                onChange={handleContentChange}
                                value={content}
                                />
                            )}
                        </div>

                        {isRecording ? (
                            <button 
                                type="button"
                                onClick={handleStopRecording}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100">
                                
                                <div className='size-3 rounded-full bg-red-500 animate-pulse' />
                                Gravando... (clique p/ interromper)
                            </button>
                        ) : (
                            <button 
                                type="button"
                                onClick={handleSaveNote}
                                className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500 focus-visible:bg-lime-500">
                                Salvar nota
                            </button>
                        )}

                        
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}