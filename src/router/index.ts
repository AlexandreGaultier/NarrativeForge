import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import BookList from '../views/BookList.vue';
import BookEditor from '../views/BookEditor.vue';
import BookReader from '../views/BookReader.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: '/books'
        },
        {
          path: 'books',
          name: 'books',
          component: BookList
        },
        {
          path: 'books/:id/edit',
          name: 'book-edit',
          component: BookEditor,
          props: true
        },
        {
          path: 'books/:id/read',
          name: 'book-read',
          component: BookReader,
          props: true
        },
        {
          path: 'books/new',
          name: 'new-book',
          component: BookEditor,
          props: { isNew: true }
        }
      ]
    }
  ]
});

export default router; 