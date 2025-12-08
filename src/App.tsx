import AsciiView from './components/asciiView'
import Header from './components/header'
import Settings from './components/settings'

function App() {
    return (
        <>
            <div className="h-screen w-screen flex flex-col justify-between ">
                <div className="w-full flex flex-row justify-between items-center">
                    <Header />
                    <Settings />
                </div>

                <div className="fixed h-full w-screen flex justify-center items-center">
                    <AsciiView />
                </div>

                <div>THIS IS CAMERA BUTTONS</div>
            </div>
        </>
    )
}

export default App
