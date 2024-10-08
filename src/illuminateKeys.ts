let allKeyboardLetters = document.querySelectorAll('.kbd');
let arrayOfKeys = Array.from(allKeyboardLetters);


export function illuminateKeys(letter: string, colorCode: string, reset): void {

    arrayOfKeys.forEach((key) => {
        if (key.innerHTML === letter) {
            console.log('key.innerHTML, letter', key.innerHTML, letter);

            switch (colorCode) {
                case "hit":
                    key.classList.add('bg-yellow-200');
                    key.classList.remove('text-pink-200');
                    key.classList.add('text-black');
                    break;
                case "green":
                    key.classList.remove('bg-yellow-200');
                    key.classList.add('bg-green-200');
                    key.classList.remove('text-pink-200');
                    key.classList.add('text-black');
                    break;
                case "miss":
                    key.classList.add('bg-slate-500');
                    break;
                default:
                    break;
            }
        }
        arrayOfKeys = arrayOfKeys.filter((key) => key.innerHTML !== letter);
        if (reset) {
            arrayOfKeys = Array.from(allKeyboardLetters);
        }
    });
}