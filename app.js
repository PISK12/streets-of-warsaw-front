const API_URL='https://api.street.piotrk14.usermd.net';
let param_1 = window.location.href.toString().split(window.location.host)[1].replace('/', '');



const addToStreetList = data=>{
    const streetList = document.querySelector('#streetsList');
    cleanStreetList();
    data.forEach(item=>{
        let element = document.createElement('li');
        element.setAttribute('data-value',item.id);
        element.innerText=item.name;
        element.addEventListener('click',()=>clickToElementFromStreetList(element));
        streetList.appendChild(element);
    });
    streetList.firstChild.classList.add('selected');
};

const addToFullStreetList = data => {
    const fullStreetList = document.querySelector('#container-page-2>div>ul');
    data.forEach(item => {
        let element = document.createElement('li');
        let subElement = document.createElement('a');
        subElement.setAttribute('href', '/' + item.id + '_' + item.name);
        subElement.innerText = item.name;
        element.appendChild(subElement);
        fullStreetList.appendChild(element);
    });
};

const clickToElementFromStreetList = (element)=>{
    const input = document.querySelector('#inputStreet');
    input.setAttribute('data-value',element.getAttribute('data-value'));
    input.value=element.innerText;
    cleanStreetList();
};

const cleanStreetList = () => {
    const streetList = document.querySelector('#streetsList');
    while (streetList.firstChild){
        streetList.removeChild(streetList.firstChild);
    }
};

const cleanDetailsDistricts = () => {
    const detailsDistricts = document.querySelector('#details-districts');
    while (detailsDistricts.firstChild){
        detailsDistricts.removeChild(detailsDistricts.firstChild);
    }
};

const searchData = async () => {
    const url=new URL(API_URL+'/streets');
    const input = document.querySelector('#inputStreet');
    const params = {search:input.value};
    url.search = new URLSearchParams(params).toString();
    return await fetch(url,{
        method:'GET',
        headers:{
            'Accept':'application/json'
        },
        cache: "force-cache",
    })
        .then(response=>{return response.json()})
    ;
};

const getData = async (page = 1) => {
    const url = new URL(API_URL + '/streets');
    const params = {page: page, 'per-page': 200};
    url.search = new URLSearchParams(params).toString();
    return await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        cache: "force-cache",
    })
};

const showDetails = data =>{
    document.getElementById('details-name').innerText=data.name;
    const detailsDistricts = document.getElementById('details-districts');
    data.districts.forEach(item=>{
        let element=document.createElement('li');
        element.innerText=item.name;
        detailsDistricts.appendChild(element);
    });
};

const getDetails = async id =>{
    const url=new URL(API_URL+'/streets/'+id);
        return await fetch(url,{
            method:'GET',
            headers:{
                'Accept':'application/json',
            },
            cache: "force-cache",
        }).then(response => response.json());
};

searchData().then(data => {
    addToStreetList(data);
});

document.querySelector('#inputStreet').addEventListener('click', () => {
    searchData().then(data => {
        addToStreetList(data);
    });
});

document.querySelector('#inputStreet').addEventListener('input', () => {
    const input = document.querySelector('#inputStreet');
    input.removeAttribute('data-value');
    searchData().then(data => {
        addToStreetList(data);
    });
});

if (parseInt(param_1) > 0) {
    getDetails(parseInt(param_1)).then(data => showDetails(data));
}


const configObserver = {attributes: true, childList: false, subtree: false};
const targetNode = document.getElementById('inputStreet');
// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
    for(let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName==='data-value') {
            const id=mutation.target.getAttribute('data-value');
            if(id!==null)
            {
                getDetails(id).then(data=>showDetails(data));
            }else{
                document.getElementById('details-name').innerText='';
                cleanDetailsDistricts();
            }
        }
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, configObserver);

document.addEventListener('keydown', evt => {
    const streetsList = document.querySelector('#streetsList');
    const selected = streetsList.querySelector('.selected');

    const getNext = (evt, oldSelected) => {
        if (evt.code === 'ArrowUp') {
            if (oldSelected.previousSibling === null) {
                return streetsList.lastChild;
            } else {
                return oldSelected.previousSibling;
            }
        } else if (evt.code === 'ArrowDown') {
            if (oldSelected.nextSibling === null) {
                return streetsList.firstChild;
            } else {
                return oldSelected.nextSibling;
            }
        } else {
            return null;
        }
    };
    if (evt.code === 'ArrowUp' || evt.code === 'ArrowDown') {
        const newSelected = getNext(evt, selected);
        if (newSelected !== null) {
            selected.classList.remove('selected');
            newSelected.classList.add('selected');
        }
    }

    if (evt.code === 'Enter') {
        clickToElementFromStreetList(selected);
    }
});

window.addEventListener('wheel', evt => {
    if (evt.deltaY > 0) {
        document.getElementById('container-page-1').style.display = 'none';
        document.getElementById('container-page-2').style.display = 'grid';
    }
});

let pageNumber = 1;
let maxPageNumber = -1;
window.addEventListener('wheel', evt => {
    if (evt.deltaY > 0 && (window.screen.availHeight * 3) > document.querySelector('body').getBoundingClientRect().bottom && (maxPageNumber === -1 || maxPageNumber >= pageNumber)) {
        getData(pageNumber).then(response => {
            maxPageNumber = response.headers.get('X-Pagination-Page-Count');
            return response.json()
        }).then(response => addToFullStreetList(response));
        pageNumber = pageNumber + 1;
    }
});

let inTurnUp = 0;
let inTurnDown = 0;
window.addEventListener('wheel', evt => {
    if (evt.deltaY > 0 && (window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        inTurnDown += 1;
        inTurnUp = 0;
    } else if (evt.deltaY < 0 && document.querySelector('body').getBoundingClientRect().y === 0) {
        inTurnUp += 1;
        inTurnDown = 0;
    }
});

window.addEventListener('wheel', evt => {
    if (evt.deltaY < 0 && inTurnUp > 3) {
        document.getElementById('container-page-1').style.display = 'block';
        document.getElementById('container-page-2').style.display = 'none';
        inTurnUp = 0;
        inTurnDown = 0;
    }
});
