const users = []

// add user
const addUser = ({id, username, room})=>{
    // clean the data means removing extra spaces etc
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if(!username || !room){
        return {
            error: "Username and room are required"
        }
    }

    // check for unique user
    const userCheck = users.find((user)=>{
        return user.room === room && user.username === username
    })

    // if not unique then throw error
    if(userCheck){
        return {
            error: "Username is in use!"
        }
    }

    // store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

// remove user
const removeUser = (id)=>{
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

// get user
const getUser = (id)=>{
    return users.find((user)=>user.id === id)
}

// get users in room
const getUsersInRoom = (room)=>{
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}