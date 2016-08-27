var Model = {
    login: function(appId, perms) {
        return new Promise(function(resolve, reject) {
            VK.init({
                apiId: appId
            });

            VK.Auth.login(function(response) {
                if (response.session) {
                    resolve(response);
                } else {
                    reject(new Error('Не удалось авторизоваться'));
                }
            }, perms);
        });
    },
    callApi: function(method, params) {
        return new Promise(function(resolve, reject) {
            VK.api(method, params, function(response) {
                if (response.error) {
                    reject(new Error(response.error.error_msg));
                } else {
                    resolve(response.response);
                }
            });
        });
    },
    getUser: function() {
        return this.callApi('users.get', {});
    },
    getMusic: function() {
        return this.callApi('audio.get', {});
    },
    getFriends: function() {
        return this.callApi('friends.get', {fields: 'photo_100'});
    },
    getNews: function() {
        return this.callApi('newsfeed.get', {filters: 'post', count: 20});
    },
    getGroups: function() {
        return this.callApi('groups.get', {extended: 1, fields: ['name', 'photo_100']});
    },
    getPhotos: function() {
        return this.callApi('photos.getAll', {v: '5.53', extended: 1, count: 200});        
    },
    get200MorePhotos(photosCount) {

        let code =  'var photos = [];'
                    + 'photos.push(API.photos.getAll({"v": "5.53", "extended": "1", "count": "200", "offset": ' 
                    + this.userPhotos.length + '}).items);'
                    + 'var offset = 200;'
                    + 'while (offset < ' + photosCount + ' && (offset + ' + this.userPhotos.length + ') < ' + photosCount + ' )'
                        + '{'
                            + 'photos.push(API.photos.getAll({"v": "5.53", "extended": "1", "count": "200", "offset": (' 
                                + this.userPhotos.length + ' + offset)}).items);'
                            + 'offset = offset + 200;'
                        + '};'
                    + 'return photos;'

        return new Promise( (resolve, reject) => {
            VK.api('execute', {code: code}, data => {
                if(data.response) {
                    data.response.forEach( array => {
                        this.userPhotos = this.userPhotos.concat(array);
                    });
                    if(photosCount > this.userPhotos.length) {
                        setTimeout(function() {this.get200MorePhotos(photosCount);}, 333);
                    } else {
                        resolve(this.userPhotos);
                    }  
                } else {
                    reject(data.error.error_msg);
                }
            });
        });

    },
    getComments: function(photoIds) {
        
        let code = `var i = ${this.photoComments.length};
                    var photoComments = [];
                    var photosList = "${photoIds}".split(",");
                    while(i < ${this.photoComments.length} + 25 && i < photosList.length) {
                        photoComments.push(API.photos.getComments({
                            "v": "5.53",
                            "photo_id": photosList[i],
                            "sort": "asc",
                            "extended": "1"
                        }));
                        i = i + 1;
                    };
                    return photoComments;`

            new Promise( (resolve,reject) => {
                VK.api('execute', {code: code}, data => {
                    if(data.response) {
                        this.photoComments = this.photoComments.concat(data.response);
                        if(this.photoComments.length < photoIds.length) {
                            setTimeout(function() {Model.getComments(photoIds);}, 333);
                        } else { 
                            resolve(this.photoComments);
                        }    
                    } else {
                        reject(data.error.error_msg);
                    }
                });
            }).then( data => {
                Controller.commentsRoute(data);
            });
    },
    userPhotos: [],
    photoComments: [],
};
