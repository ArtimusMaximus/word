import { WordOfTheDay } from "./getWordOfTheDay";
// import { sWords } from "./sWords";

export class ResetGameState {
    public reset: boolean;
    public wordOfTheDay: string;
    public wordOfTheDayLetters: string[];
    public wotd: string;

    constructor(reset: boolean, wotd: string) {
        this.reset = reset;
        this.wotd = wotd;
        let currentWordOfTheDay = new WordOfTheDay(this.wotd); // set word of day
        let w = currentWordOfTheDay.getWordOfTheDayAndLetters();
        this.wordOfTheDay = w.wordOfTheDay;
        this.wordOfTheDayLetters = w.wordOfTheDayLetters;

        document.querySelectorAll('.kbd').forEach((key) => {
            key.classList.remove('bg-yellow-200');
            key.classList.remove('bg-green-200');
            key.classList.remove('bg-slate-500');
            key.classList.add('bg-black');
            key.classList.remove('text-black');
            key.classList.add('text-pink-200');
        });
        document.querySelectorAll('.word-row').forEach((wordRow) => {
            wordRow.innerHTML = "";
            wordRow.classList.remove("bg-green-200");
            wordRow.classList.remove("bg-yellow-200");
            wordRow.classList.remove("bg-slate-500");
            wordRow.classList.add("bg-black");
        });
        console.log("reset");
    }
    setResetFalse(): void  {
        this.reset = false;
    }
}