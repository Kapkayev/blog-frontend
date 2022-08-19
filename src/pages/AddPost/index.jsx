import React from 'react';
import axios from "../../axios";
import { useSelector } from "react-redux";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import SimpleMDE from 'react-simplemde-editor';

import { selectIsAuth } from "../../redux/slices/auth";

import 'easymde/dist/easymde.min.css';
import styles from './AddPost.module.scss';

export const AddPost = () => {
  const { id } = useParams()
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const [isLoading, setLoading] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [text, setText] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const inputFileRef = React.useRef(null);

  const isEditing = Boolean(id);

  const handleChangeFile = async (event) => {
    try{
      const formData = new FormData();
      const file = event.target.files[0];
      formData.append('image', file);
      const { data } = await axios.post('/uploads', formData);
      setImageUrl(data.url);
      console.log(data);
    } catch(err) {
      console.warn(err);
      alert('File upload error');
    }
  };

  const onClickRemoveImage = () => {
    if(window.confirm('Are you sure?')){
      setImageUrl('');
    }
  };

  const onChange = React.useCallback((value) => {
    setText(value);
  }, []);

  const onSubmit = async () => {
    try{
      setLoading(true);
      const fields = {
        title,
        text,
        tags,
        imageUrl
      }
      const { data } = isEditing
        ? await axios.patch(`posts/${id}`, fields)
        : await axios.post('/posts', fields);

      const _id = isEditing ? id : data._id;

      navigate(`/posts/${_id}`);

    } catch(err){
      console.warn(err);
      alert('Error creating article');
    }
  }

  React.useEffect(() => {
    if(id){
      axios.get(`posts/${id}`).then(({ data }) => {
         setTitle(data.title);
         setText(data.text);
         setImageUrl(data.imageUrl);
         setTags(data.tags.join(','));
      }).catch(err => {
        console.war(err);
      })
    }
}, [])

  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: '400px',
      autofocus: true,
      placeholder: 'Введите текст...',
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    [],
  );

  if(!window.localStorage.getItem('token') && !isAuth){
    return <Navigate to="/" />
  }

  return (
    <Paper style={{ padding: 30 }}>

      <Button onClick={() => inputFileRef.current.click()} variant="outlined" size="large">
        Upload preview
      </Button>

      <input ref={inputFileRef} type="file" onChange={handleChangeFile} hidden />

      {imageUrl && (
        <>
          <Button variant="contained" color="error" onClick={onClickRemoveImage}>
            Delete
          </Button>
          <img className={styles.image} src={`http://localhost:4444/${imageUrl}`} alt="Uploaded" />
        </>
      )}

      <br />
      <br />

      <TextField
        classes={{ root: styles.title }}
        value={title}
        onChange={e => setTitle(e.target.value)}
        variant="standard"
        placeholder="Title..."
        fullWidth
      />

      <TextField 
        classes={{ root: styles.tags }} 
        value={tags}
        onChange={e => setTags(e.target.value)}
        variant="standard" 
        placeholder="Tags" 
        fullWidth />

      <SimpleMDE className={styles.editor} value={text} onChange={onChange} options={options} />

      <div className={styles.buttons}>
        <Button onClick={onSubmit} size="large" variant="contained">
          {!isEditing ? 'Publish' : 'Update'}
        </Button>
        
        <Link to="/">
          <Button size="large">Cancel</Button>
        </Link>
      </div>

    </Paper>
  );
};
