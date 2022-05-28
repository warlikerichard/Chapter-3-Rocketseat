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

  const averageWords = post.data.content.reduce(
    (counter, content) => {
      const words = RichText.asText(content.body).split(" ").concat(content.heading.split(" "))
      return counter + words.length;
    }, 0)/200

    const averageReadingTime = Math.round(averageWords) < averageWords ? 
    Math.round(averageWords) + 1 : Math.round(averageWords);

  return !router.isFallback ? (

    <div>
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" width="100%"/>
      </div>
      <header className={commonStyles.container}>
        <h1 className={styles.bigTitle}>{post.data.title}</h1>
        <section className={styles.informations}>
          <span>
            <FiCalendar className={commonStyles.icon} size={20}/> {post.first_publication_date}
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
            return(
              <>
                <h1>{section.heading}</h1>
                <div dangerouslySetInnerHTML={{__html: RichText.asHtml(section.body)}}/>
              </>
            )
          })}
        </main>
      </header>
    </div>

  ) : (

      <main className={commonStyles.container}>
        <div className={styles.loading}>
          <GiSadCrab size={65} className={commonStyles.icon} color='#FF57B2'/> Loading...
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
  const response = await prismic.getByUID('post', slug.toString());

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      "dd MMM yyyy",
      {
        locale: ptBR,
      }
    ),
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
