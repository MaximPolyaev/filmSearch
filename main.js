const apiKey = '46de7c7911ce1ec7463cd1e8e5e2f8ed';
const searchForm = document.querySelector('#search-form');
const movie = document.querySelector('#movies');
const urlPoster = 'https://image.tmdb.org/t/p/w500';

function apiSearch(event) {
    event.preventDefault();
    
    const searchText = document.querySelector('.form-control').value;
    if(searchText.trim().length === 0) {
        movie.innerHTML = '<h2 class="col-12 text-center text-danger">Поле поиска не должно быть пустым</h2>';
        return;
    }

    movie.innerHTML = '<div class="loader">Загрузка...</div>';

    fetch('https://api.themoviedb.org/3/search/multi?api_key=' + apiKey + '&language=ru&query=' + searchText)
        .then(function(value) {
            if(value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })
        .then(function(output) {
            let inner = '';
            if(output.results.length === 0) {
                inner = '<h2 class="col-12 text-center text-danger">По вашему запросу ничего не найдено</h2>';
            }
            output.results.forEach(function (item) {
                let nameItem = item.name || item.title;
                const poster = item.poster_path ? urlPoster + item.poster_path : '/noposter.png';
                let dataInfo = '';
                if(item.media_type !== 'person') {
                    dataInfo = `data-id="${item.id}" data-type="${item.media_type}"`;
                }
                inner += `
                    <div class="col-12 col-md-4 col-xl-3 item">
                        <img src="${poster}" alt="${nameItem}" class="img_poster" ${dataInfo}>
                        <h5>${nameItem}</h5>
                    </div>
                `;
            });

            movie.innerHTML = inner;

            addEventMedia();
        })
        .catch(function(reason) {
            movie.innerHTML =  'Упс, что-то пошло не так!';
            console.error('error: ' + reason.status);
        })
    ;
}

searchForm.addEventListener('submit', apiSearch);

function addEventMedia() {
    const media = movie.querySelectorAll('img[data-id]');
    media.forEach(function(elem) {
        elem.style.cursor = 'pointer';
        elem.addEventListener('click', showFullInfo);
    });
}

function showFullInfo() {
    let url = '';
    if(this.dataset.type === 'movie'){
        url = `https://api.themoviedb.org/3/movie/${this.dataset.id}?api_key=46de7c7911ce1ec7463cd1e8e5e2f8ed&language=ru`;
    } else if(this.dataset.type == 'tv') {
        url = `https://api.themoviedb.org/3/tv/${this.dataset.id}?api_key=46de7c7911ce1ec7463cd1e8e5e2f8ed&language=ru`;
    } else {
        movie.innerHTML = '<h2 class="col-12 text-center text-danger">Произошла ошибка, повторите позже</h2>';
    }
    
    fetch(url)
        .then((value) => {
            if(value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })
        .then(output => {
            movie.innerHTML = `
            <h4 class="col-12 text-center text-info">${output.name || output.title}</h4>
            <div class="col-4">
                <img src="${output.poster_path ? urlPoster + output.poster_path : './noposter.png'}" alt="${output.name || output.title}">
                ${(output.homepage) ? `<p class="text-center"><a href="${output.homepage}" target="_blank">Официальная страница</a></p>` : ``}
                ${(output.imdb_id) ? `<p class="text-center"><a href="https://imdb.com/title/${output.imdb_id}" target="_blank">Страница на IMDB.com</a></p>` : ``}
            </div>
            <div class="col-8">
                ${(output.vote_average) ? `<p> Рейтинг: ${output.vote_average}</p>` : ''}
                ${(output.status) ? `<p> Статус: ${output.status}</p>` : ''}
                <p> Премьера: ${output.release_date || output.first_air_date || 'Дата не обозначена'}</p>

                ${(output.last_episode_to_air) ? `<p>${output.number_of_seasons} сезон ${output.last_episode_to_air.episode_number} серий вышло</p>` : ''}
                <p>Описание: ${output.overview}</p>

                <br>
                <div class="youtube">Ютуб</div>
            </div>
            `;
            
            getVideo(this.dataset.type, this.dataset.id);
        });
        // .catch((reason) => {
        //     movie.innerHTML =  'Упс, что-то пошло не так!';
        //     console.error('error: ' + reason.status);
        // });
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('https://api.themoviedb.org/3/trending/all/week?api_key=46de7c7911ce1ec7463cd1e8e5e2f8ed&language=ru')
        .then(function(value) {
            if(value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })
        .then(function(output) {
            let inner = '<h4 class="col-12 text-center text-info">Популярные за  неделю</h4>';
            if(output.results.length === 0) {
                inner = '<h2 class="col-12 text-center text-danger">По вашему запросу ничего не найдено</h2>';
            }
            output.results.forEach(function (item) {
                let nameItem = item.name || item.title;
                let mediaType = item.title ? 'movie' : 'tv';
                const poster = item.poster_path ? urlPoster + item.poster_path : '/noposter.png';
                let dataInfo = `data-id="${item.id}" data-type="${mediaType}"`;
                inner += `
                    <div class="col-12 col-md-4 col-xl-3 item">
                        <img src="${poster}" alt="${nameItem}" class="img_poster" ${dataInfo}>
                        <h5>${nameItem}</h5>
                    </div>
                `;
            });

            movie.innerHTML = inner;

            addEventMedia();
        })
        .catch(function(reason) {
            movie.innerHTML =  'Упс, что-то пошло не так!';
            console.error('error: ' + reason.status);
        })
    ;
});

function getVideo(type, id) {
    let youtube = movie.querySelector('.youtube');

    fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${apiKey}&language=ru`)
        .then((value) => {
            if(value.status !== 200) {
                return Promise.reject(value);
            }
            return value.json();
        })
        .then((output) => {
            let videoFrame = `<h5 class="text-info">Трейлеры</h5>`;

            if(output.results.length !== 0) {
                output.results.forEach((item) => {
                    videoFrame += '<iframe width="100%" height="350px" src="https://www.youtube.com/embed/' + item.key + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'; 
    
                });
            } else {
                videoFrame = 'Трейлеры отсутствуют';
            }

            youtube.innerHTML = videoFrame;
        });
        // .catch((reason) => {
        //     youtube.innerHTML = 'Видео не найдено';
        //     console.error(reson || reason.status);
        // });


    youtube.innerHTML = id;
}