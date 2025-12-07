
function Header() {
    return (
        <>
            <div className="m-4 flex flex-col justify-center items-start gap-1">
                <h1 className="font-bold text-3xl">ASCII-IT</h1>
                <div className="flex flex-row gap-4 text-xs md:text-sm ">
                    <span>FPS: 30</span>
                    <span>Render: 15.0ms</span>
                    <span>RES: 1980x1200</span>
                </div>
            </div>
        </>
    )
}

export default Header;