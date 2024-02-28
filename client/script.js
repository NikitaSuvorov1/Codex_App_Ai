import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')
const modal = document.getElementById("modal");
const selectTemplateBtn = document.getElementById("selectTemplateBtn");
const closeBtn = document.getElementsByClassName("close")[0];
selectTemplateBtn.onclick = function () {
    modal.style.display = "block";
  };
  
  // Закрытие модального окна при нажатии на "крестик"
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };
  
  // Закрытие модального окна при щелчке вне окна
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}


function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)
    const prompt = data.get('prompt')
    
    // Получение выбранного текста шаблона
    const templateSelect = document.getElementById('templateSelect')
    const selectedTemplate = templateSelect.options[templateSelect.selectedIndex].text

    // Объединение основного текста с текстом шаблона
    const combinedPrompt = `${prompt} ${selectedTemplate}`

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, prompt)

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    try {
        const response = await fetch('http://localhost:5000', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: combinedPrompt, // Комбинированный текст шаблона и основного текста
            }),
        });

        clearInterval(loadInterval)
        messageDiv.innerHTML = " "

        if (response.ok) {
            const responseData = await response.json();
            const parsedData = responseData.bot.trim(); 

            typeText(messageDiv, parsedData)
        } else {
            const err = await response.text()

            messageDiv.innerHTML = "Something went wrong"
            alert(err)
        }
    } catch (error) {
        console.error(error);
        messageDiv.innerHTML = "Something went wrong"
        alert("Error in fetch operation");
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})