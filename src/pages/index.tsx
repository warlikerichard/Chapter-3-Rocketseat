import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { FiCalendar, FiUser} from 'react-icons/fi';
import { GiSadCrab } from 'react-icons/gi';
import Link from 'next/link';

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

  }, [newPage])

  useEffect(() =>{
    setAllPages({next_page: postsPagination.next_page, results: results});
  }, [])

  return next_page ? (
    
      <main className={commonStyles.container}>
        {
          allPages.results.map((post) => {
            return(
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <div className={styles.post} key={post.uid}>
                  <h1>{post.data.title}</h1>
                  <p>{post.data.subtitle}</p>
                  <section>
                    <span>
                      <FiCalendar className={commonStyles.icon} size={20}/> {format(
                        new Date(post.first_publication_date),
                        "dd MMM yyyy",
                        {
                          locale: ptBR
                        }
                      )}
                    </span> 

                    <span>
                      <FiUser className={commonStyles.icon} size={20}/> {post.data.author}
                    </span>
                  </section>
                </div>
              </Link>
            )
          })
        }
        <div className={styles.load}>
          <p onClick={() => handleLoadMore(next_page, setNewPage)}>Carregar mais posts</p>
        </div>
      </main>

  ) : (

    <main className={commonStyles.container}>
      {
        allPages.results.map((post) => {
          return(
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <div className={styles.post} key={post.uid}>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <section>
                  <span><FiCalendar className={commonStyles.icon} size={20}/>
                  {format(
                        new Date(post.first_publication_date),
                        "dd MMM yyyy",
                        {
                          locale: ptBR
                        }
                      )}
                  </span>

                  <span><FiUser className={commonStyles.icon} size={20}/>
                    {post.data.author}
                  </span>
                </section>
              </div>
            </Link>
          )
        })
      }

      <div className={styles.noContent}>
        <GiSadCrab size={40} className={styles.crab}/> Ops! Parece que você chegou ao fim da lista!
      </div>
      
    </main>

  )
}

export const getStaticProps : GetStaticProps = async () => {
    const prismic = getPrismicClient({});
    const postsResponse = await prismic.getByType('post', {
      page: 1,
      pageSize: 2,
      orderings: {
        field: 'document.first_publication_date',
        direction: 'desc'
      },
    });

    const results = postsResponse.results.map(post => {
      return{
          uid: post.uid,
          first_publication_date: post.first_publication_date,
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
  const response = await fetch(next_page).then(function(response){
    return response.json();
  })

  const results = response.results.map(post => {
    return{
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }
  })

  setNewPage({
    next_page: response.next_page,
    results
  });
}
