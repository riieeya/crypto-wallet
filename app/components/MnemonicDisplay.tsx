import { ChevronDown, ChevronUp, Copy, Info } from "lucide-react";

interface MnemonicProps {
    showMnemonic : boolean;
    setShowMnemonic : (value : boolean) => void;
    mnemonicWords : string [];
    copyToClipboard : (content : string) => void;
}

export const MnemonicDisplay = ({
    showMnemonic,
    setShowMnemonic,
    mnemonicWords,
    copyToClipboard
} : MnemonicProps) => {
    return (
    <div className=" w-full group flex flex-col items-center gap-4 cursor-pointer rounded-lg border border-white/10 p-8">
        <div className="flex w-full justify-between items-center" onClick={() => setShowMnemonic(!showMnemonic)}>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
                Your Secret Phrase
            </h2>
            <button className="hover:bg-white/5 hover:cursor-pointer p-2" onClick={() => setShowMnemonic(!showMnemonic)}>
                {showMnemonic ? (
                    <ChevronUp className="size-4" />
                ) : (
                    <ChevronDown className="size-4" />
                )}
            </button>
        </div>

        {showMnemonic && (
            <div className="flex flex-col w-full items-center justify-center" onClick={() => copyToClipboard(mnemonicWords.join(" "))}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center w-full items-center mx-auto my-8">
                    {mnemonicWords.map((word , index) => (
                        <p className="md:text-lg bg-foreground/5 text-white hover:bg-foreground/10 transition-all duration-300 rounded-lg p-4" key={index}>
                            {word}
                        </p>
                    ))}
                </div>
                <div className="text-sm md:text-base text-primary/50 flex w-full gap-2 justify-between items-center group-hover:text-primary/80 transition-all duration-300">
                    <span className="flex items-center gap-2"><Copy className="size-4" /> Click Anywhere To Copy</span>
                    <span className="flex items-center gap-2 text-red-500"><Info className="size-4" /> Do not share this with anyone.</span>
                </div>
            </div>
            
        )}
    </div>
    )
}