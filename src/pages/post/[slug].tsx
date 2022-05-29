import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';
import { RichText }  from 'prismic-dom';
 
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { GiSadCrab } from 'react-icons/gi';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post} : PostProps) {
  const router = useRouter();

  //Colocar isso em um try catch

  let averageReadingTime = '';
  try{
    const averageWords = post.data.content.reduce(
      (counter, content) => {
        const words = RichText.asText(content.body).split(" ").concat(content.heading.split(" "))
        return counter + words.length;
      }, 0)/200
  
      averageReadingTime = Math.round(averageWords) < averageWords ? 
      (Math.round(averageWords) + 1).toString() : Math.round(averageWords).toString();
  }
  catch{
    averageReadingTime = 'loading...'
  }

  return !router.isFallback ? (

    <div>
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" width="100%"/>
      </div>
      <header className={commonStyles.container}>
        <h1 className={styles.bigTitle}>{post.data.title}</h1>
        <section className={styles.informations}>
          <span>
            <FiCalendar className={commonStyles.icon} size={20}/> {format(
              new Date(post.first_publication_date),
              "dd MMM yyyy",
              {
                locale: ptBR,
              }
            )}
          </span> 

          <span>
            <FiUser className={commonStyles.icon} size={20}/> {post.data.author}
          </span>

          <span>
            <FiClock className={commonStyles.icon} size={20}/> {averageReadingTime} min
          </span>
        </section>

        <main className={styles.content}>
          {post.data.content.map(section => {
            let r = (Math.random() + 1).toString(36).substring(7);
            return(
              <div key={r}>
                <h1>{section.heading}</h1>
                <div dangerouslySetInnerHTML={{__html: RichText.asHtml(section.body)}}/>
              </div>
            )
          })}
        </main>
      </header>
    </div>

  ) : (

      <main className={commonStyles.container}>
        <div className={styles.loading}>
          <GiSadCrab size={65} className={commonStyles.icon} color='#FF57B2'/> Carregando...
        </div>
    </main>

  )
}

export const getStaticPaths : GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post',{
    page: 1,
    pageSize: 2,
  });

  const paths = posts.results.reduce(
    (prevList, nextPost) => {
      return prevList.concat({params: {slug: nextPost.uid}})
    },
    []
  )

  return{
    paths,
    fallback: true,
  }
};

export const getStaticProps : GetStaticProps = async ({params}) => {
  const prismic = getPrismicClient({});
  const {slug} = params;
  const response = await prismic.getByUID('post', String(slug));

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner:{
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    }
  }

  //
  return{
    props:{
      post
    },
    revalidate: 60*60*1 //1 hour
  };
};
