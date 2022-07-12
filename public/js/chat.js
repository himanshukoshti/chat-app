const socket = io()

// Elements
const $messageForm = document.querySelector("#message-form")
const $messageFornInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

// templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

// Join code
const newJoinCode = Math.random().toString(36).substring(2,10); 

// options
const {username, room=newJoinCode} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = ()=>{
    // new message
    const $newMessage = $messages.lastElementChild

    // height of last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container
    const containerHeight = $messages.scrollHeight

    // how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message)=>{
    // console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoScroll()
})

socket.on('locationMessage', (url)=>{
    // console.log(url)
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.text,
        createdAt: moment(url.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoScroll()
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})

$messageForm.addEventListener("submit", (e)=>{
    e.preventDefault()

    // disable the button
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (message,error)=>{
        // re enable the button
        $messageFormButton.removeAttribute('disabled')
        // clearing the input box and creating focus on input box
        $messageFornInput.value = ""
        $messageFornInput.focus()

        if(error){
            return console.log(error)
        }
        // console.log("The message was delivered", message)
    })
})

$sendLocationButton.addEventListener("click", ()=>{
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by your browser!")
    }

    // disable the send location button
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        socket.emit('sendLocation', {latitude,longitude}, ()=>{
            // re enable the send location button
            $sendLocationButton.removeAttribute('disabled')
    
            // console.log("The location was delivered")
        })
    })
})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})