
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/tasks';
const db = mongoose.connection;


const userSchema = mongoose.Schema({
    name: String,
    id: mongoose.Schema.Types.ObjectId
});

const taskSchema = mongoose.Schema({
    name: String,
    description: String,
    id: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    isOpened: Boolean
});

//Проверка существования пользователя при назначении
taskSchema.pre('save', function(next) {
    if(this.userId) {
        User.findById(this.userId)
            .then(result => {
                if(result.name.length) {
                    next();
                }
            })
            .catch(err => {
                next(new Error(`Пользователь ${this.userId} не найден`));
            });
    }
    next();
});

taskSchema.pre('update', function(next) {
    if(this.userId) {
        User.findById(this.userId)
            .then(result => {
                if(result.name.length) {
                    next();
                }
            })
            .catch(err => {
                next(new Error(`Пользователь ${this.userId} не найден`));
            });
    }
    next();
});



const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);


db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    console.log('DB connected');
});


app.listen(port, function () {
    console.log(`Server on port ${port}!`);
    mongoose.connect(url);
});


// добавление пользователя
app.post('/users', function(req, res) {

    let name = req.header('name');

    if(name.length == 0) {
        res
            .status(400)
            .send(
                JSON.stringify(
                    {message: 'Не передан параметр name'}
                )
            );
        return;
    }

    let user = new User();
    user.name = name;

    user.save()
        .then(user => {
            res
                .status(200)
                .send(
                    JSON.stringify(
                        {message: `Пользователь ${user.name} добавлен`}
                    )
                );
        })
        .catch(err => {
            res
                .status(400)
                .send(
                    JSON.stringify(
                        {message: err}
                    )
                );
        })


});

// отображение пользователей
app.get('/users', function (req, res) {

    User.find({}, 'id name')
        .then(result => {

            if (result.length > 0) {
                res
                    .status(200)
                    .send(
                        result
                    );
            }
            else {
                res
                    .status(500)
                    .send(
                        JSON.stringify(
                            {message: 'Нет пользователей'}
                        )
                    );
            }

        })

});

// удаление пользователя
app.delete('/users', function (req, res) {

    let id = req.header('id');

    User.findByIdAndRemove(id)
        .then(user => {
            res
                .status(200)
                .send(
                    JSON.stringify(
                        {message: `Пользователь ${user.name} удален`}
                    )
                );
        })
        .catch(() => {
            res
                .status(400)
                .send(
                    JSON.stringify(
                        {message: 'Пользователь не найден'}
                    )
                );
        });
});

// Обновление пользователя
app.put('/users', function (req, res) {

    let id = req.header('id');
    let name = req.header('name');

    if(name.length == 0) {
        res
            .status(400)
            .send(
                JSON.stringify(
                    {message: 'Не передан параметр name'}
                )
            );
        return;
    }

    User.findByIdAndUpdate(id, {name: name}, {new: true})
        .then(user => {
            res
                .status(200)
                .send(user);
        })
        .catch(() => {
                res
                    .status(400)
                    .send(
                        JSON.stringify(
                            {message: 'Пользователь не найден'}
                        )
                    );
        });
});



// добавление задачи
app.post('/tasks', function(req, res) {

    let name = req.header('name');
    let description = req.header('description');
    let isOpened = req.header('isopened');
    let userId = req.header('userid');

    if(name.length == 0) {
        res
            .status(400)
            .send(
                JSON.stringify(
                    {message: 'Не передан параметр name'}
                )
            );
        return;
    }

    let task = new Task();

    task.name = name;

    if(description) task.description = description;
    if(isOpened == true) task.isOpened = true;
    else task.isOpened = false;

    if(userId) task.userId = userId;

    task.save()
        .then(task => {
            res
                .status(200)
                .send(
                    JSON.stringify(
                        {message: `Задача ${task.name} добавлена`}
                    )
                );
        })
        .catch(err => {
            res
                .status(400)
                .send(
                    JSON.stringify(
                        {message: err.message}
                    )
                );
        })


});

// отображение и поиск задач
app.get('/tasks', function (req, res) {

    let name = req.header('name');
    let description = req.header('description');

    let filter = new Object();

    if(name) filter.name = new RegExp(name, 'i');
    if(description) filter.description = new RegExp(description, 'i');

    Task.find(filter)
        .then(result => {

            if (result.length > 0) {
                res
                    .status(200)
                    .send(
                        result
                    );
            }
            else {
                res
                    .status(500)
                    .send(
                        JSON.stringify(
                            {message: 'Нет задач'}
                        )
                    );
            }

        })

});

// удаление задач
app.delete('/tasks', function (req, res) {

    let id = req.header('id');

    Task.findByIdAndRemove(id)
        .then(task => {
            res
                .status(200)
                .send(
                    JSON.stringify(
                        {message: `Задача ${task.name} удалена`}
                    )
                );
        })
        .catch(() => {
            res
                .status(400)
                .send(
                    JSON.stringify(
                        {message: 'Задача не найдена'}
                    )
                );
        });
});

// Обновление задачи
app.put('/tasks', function (req, res) {

    let id = req.header('id');

    let name = req.header('name');
    let description = req.header('description');
    let isOpened = req.header('isopened');
    let userId = req.header('userid');

    let updateFields = new Object();

    if(name) updateFields.name = name;
    if(description) updateFields.description = description;
    if(isOpened) updateFields.isOpened = true;
    else updateFields.isOpened = false;
    if(userId) updateFields.userId = userId;


    Task.findByIdAndUpdate(id, updateFields, {new: true})
        .then(result => {
            if (result) {
                res
                    .status(200)
                    .send(
                        result
                    );
            }
            else {
                res
                    .status(400)
                    .send(
                        JSON.stringify(
                            {message: 'Задача не обновлена'}
                        )
                    );
            }
        })
        .catch(err => {
            res
                .status(400)
                .send(
                    JSON.stringify(
                        {message: err.message}
                    )
                );
        });
});
