import styles from '../Stage/Stage.module.css'
import PlaceHolder from '../../assets/PlaceHolder.png'

function Stage() {

    return (
        <>
            <div className={styles.stage}>
                <h1> Esse é o Palco </h1>
                <img src={PlaceHolder} alt="" className={styles.imagemCapa} /> <img/>
            </div>
        </>
    )
}

export default Stage