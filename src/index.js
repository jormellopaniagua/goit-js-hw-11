import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const gallery = document.querySelector('.gallery');
  const loadMoreBtn = document.querySelector('.load-more');

  let page = 1; // Página inicial
  let currentSearchQuery = '';

  searchForm.addEventListener('submit', async event => {
    event.preventDefault();
    const searchQuery = searchForm.elements.searchQuery.value.trim();
    if (searchQuery === '') return;

    // Limpiar la galería antes de realizar una nueva búsqueda
    gallery.innerHTML = '';

    // Resetear la página a 1 al realizar una nueva búsqueda
    page = 1;
    currentSearchQuery = searchQuery;

    await searchImages(searchQuery);
  });

  loadMoreBtn.addEventListener('click', async () => {
    page++;
    await searchImages(currentSearchQuery);
  });

  async function searchImages(searchQuery) {
    const API_KEY = '43149026-ef77b7f6113923fd46a63d2ce';
    const perPage = 40;
    const url = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(
      searchQuery
    )}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

    try {
      const response = await axios.get(url);

      const data = response.data;

      if (data.hits.length === 0) {
        // Mostrar notificación si no se encuentran imágenes
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      // Renderizar tarjetas de imágenes
      data.hits.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('photo-card');
        card.innerHTML = `
          <a href="${image.largeImageURL}" class="lightbox" data-lightbox="gallery">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" class="image"/>
          </a>
          <div class="info">
            <p class="info-item"><b>Likes:</b> ${image.likes}</p>
            <p class="info-item"><b>Views:</b> ${image.views}</p>
            <p class="info-item"><b>Comments:</b> ${image.comments}</p>
            <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
          </div>
        `;
        gallery.appendChild(card);
      });

      // Mostrar el botón "Load more" si hay más imágenes para cargar
      loadMoreBtn.style.display =
        data.totalHits > page * perPage ? 'block' : 'none';

      // Inicializar SimpleLightbox
      new SimpleLightbox('.lightbox');

      // Hacer scroll suave
      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });

      // Mostrar notificación con el número de imágenes encontradas
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    } catch (error) {
      console.error('Error fetching images:', error);
      // Mostrar notificación en caso de error
      Notiflix.Notify.failure(
        'An error occurred while fetching images. Please try again later.'
      );
    }
  }
});
