var Controller = {
    musicRoute: function() {
        return Model.getMusic().then(function(music) {
            results.innerHTML = View.render('music', {list: music});
        });
    },
    friendsRoute: function() {
        return Model.getFriends().then(function(friends) {
            results.innerHTML = View.render('friends', {list: friends});
        });
    },
    newsRoute: function() {
        return Model.getNews().then(function(news) {
            results.innerHTML = View.render('news', {list: news.items});
        });
    },
    groupsRoute: function() {
        return Model.getGroups().then(function(groups) {
            groups = groups.slice(1);
            results.innerHTML = View.render('groups', {list: groups});
        });
    },
    photosRoute: function() {
        return Model.getPhotos().then( photos => {
            return Model.get200MorePhotos(photos.count);
        }).then( photos => {
            results.innerHTML = View.render('photos', {list: photos});
            return photos;
        },
        error => {
            console.error(error);
        }).then( photos => {
            let photoIds = [];
            photos.forEach( photo => {
                photoIds.push(photo.id);
            })

            Model.getComments(photoIds);
        });
    },
    commentsRoute: function(data) {

        function lookForProfile(array, id) {
            for(let i = 0; i < array.length; i++) {
                if(array[i].id === id) return {name: `${array[i].first_name} ${array[i].last_name}`,
                                               photo: array[i].photo_50}
            }
        }

        data.forEach(item => {
            if(item.items.length > 0) {
                item.items.forEach( comment => {
                    comment.author = lookForProfile(item.profiles, comment.from_id)
                });
            }
        });

        let commentsIndicators = document.querySelectorAll('[data-indicator="comments"]');
        for(let i = 0; i < commentsIndicators.length; i++) {
            commentsIndicators[i].innerHTML = data[i].count;
            commentsIndicators[i].parentNode.nextElementSibling.innerHTML = View.render('comments', data[i]);
        }
    }
};
