import { GetStaticProps } from 'next';
import { FiCalendar, FiUser} from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  return(
    <main className={styles.container}>
      <h1>Insira título aqui</h1>
      <p>Aqui está uma descrição sobre o assunto que será abordado</p>
      <section>
        <span><FiCalendar/> 14 fev 2001</span> <span><FiUser/> Warlike Richard</span>
      </section>
    </main>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient({});
//   // const postsResponse = await prismic.getByType(TODO);

//   // TODO
// };
