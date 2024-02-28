"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const showsDataArr = [];
const $episodesList = $('#episodesList');


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await axios.get("https://api.tvmaze.com/search/shows", {params: {q: term}});
  const ratings = response.data;

  for (let rating of ratings) {
    const show = rating.show;
    const {id, name, summary, image} = show;
    showsDataArr.push({
      id,
      name,
      summary,
      image
    })
  }

  return showsDataArr;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image.original}"
              alt="${show.name} Film Still"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes?specials=1`);
  const episodes = response.data;
  const episodesArr = [];
  for (let episode of episodes) {
    const {id, name, season, number} = episode;
    episodesArr.push({
      id,
      name,
      season,
      number
    });
  }
  return episodesArr;
}

// loops through episodes and uses addLi() func to append their data to ul, also stops the hiding of $episodesArea

function populateEpisodes(episodes) {
  $episodesList.empty();
  for (let episode of episodes) {
    addLi(episode);
  }
  $episodesArea.toggle();
}

const addLi = (episode) => {
  const li = document.createElement('li');
  li.innerText =
  `Title ---> ${episode.name}
  Season: ${episode.season}
  Number: ${episode.number}
  
  `
  $episodesList.append(li);
}

// function to handle clicks on only episode buttons (not the search button); if an episode button is pressed, it collects the id of its respective card, filling and revealing the ul

async function episodeClick (e) {
  const classList = [...e.target.classList];
  if (classList.includes("Show-getEpisodes")) {
    const selectedCardID = e.target.closest(".Show").dataset.showId;
    const episodes = await getEpisodesOfShow(selectedCardID);
    await populateEpisodes(episodes);
  };
}


$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});
$showsList.on("click", episodeClick)