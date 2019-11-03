const API_URL='http://streets-of-warsaw-api.loc';
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

const searchData = async evt=>{
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
        })
            .then(response=>{return response.json()})
        ;
};

document.querySelector('#inputStreet').addEventListener('click',evt => {
    searchData.then(data=>{
        addToStreetList(data);
    });
});
document.querySelector('#inputStreet').addEventListener('input',evt => {
    const input = document.querySelector('#inputStreet');
    input.removeAttribute('data-value');
    searchData(evt).then(data=>{
        addToStreetList(data);
    });
});





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

