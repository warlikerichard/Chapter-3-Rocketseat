import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { FiCalendar, FiUser} from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

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
  next_page: string | null;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination} : HomeProps) {
  const {results} = postsPagination;
  const [allPages, setAllPages] : [PostPagination, any] = useState(postsPagination);
  const [newPage, setNewPage] : [PostPagination, any] = useState(postsPagination)
  const {next_page} = allPages

  useEffect(() =>{

    const results_all = allPages.results;
    setAllPages({next_page: newPage.next_page, results: results_all.concat(newPage.results)});
    console.log('all pages: ', allPages)

  }, [newPage])

  useEffect(() =>{
    setAllPages({next_page: postsPagination.next_page, results: results});
  }, [])

  return next_page ? (

    <main className={commonStyles.container}>
      {
        allPages.results.map((post) => {
          return(
            <div className={styles.post} key={post.uid}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <section>
                <span>
                  <FiCalendar className={commonStyles.icon} size={20}/> {post.first_publication_date}
                  </span> 

                  <span>
                    <FiUser className={commonStyles.icon} size={20}/> {post.data.author}
                  </span>
              </section>
            </div>
          )
        })
      }
      <div className={styles.load}>
        <p onClick={() => handleLoadMore(next_page, setNewPage)}>Carregar mais</p>
      </div>
    </main>

  ) : (

    <main className={commonStyles.container}>
      {
        allPages.results.map((post) => {
          return(
            <div className={styles.post} key={post.uid}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <section>
                <span><FiCalendar className={commonStyles.icon} size={20}/>
                 {post.first_publication_date}
                </span>

                 <span><FiUser className={commonStyles.icon} size={20}/>
                  {post.data.author}
                 </span>
              </section>
            </div>
          )
        })
      }
    </main>

  )
}

//Tarefa: Formatar a data (Incluindo no handleLoadMore)

export const getStaticProps : GetStaticProps = async () => {
    const prismic = getPrismicClient({});
    const postsResponse = await prismic.getByType('post', {
      page: 1,
      pageSize: 2,
    });

    const results = postsResponse.results.map(post => {
      return{
        uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              "dd 'de' MMMM 'de' yyyy",
              {
                locale: ptBR
              }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
      }
    })

    return{
      props:{
        postsPagination:{
          next_page: postsResponse.next_page,
          results,
        },
        revalidade: 60*30 //30 minutes
      },
    }

};

async function handleLoadMore(next_page: string, setNewPage: any){
  const result = await fetch(next_page).then(function(response){
    return response.json();
  })

  setNewPage(result);
}
