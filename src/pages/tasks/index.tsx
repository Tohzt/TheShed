import * as React from "react"
//import { useSession } from "next-auth/react";
import Header from "../../components/header"
import Footer from "../../components/Footer"

const Tasks = () => {
  //const { data: session } = useSession();

  return (true &&
    <>
      <Header />

      <div className="tasks-page">
        <div className="header-margin"></div>
        <div className="t-p-container">
          <div className="t-p-content">
            <h4>Tasks</h4>
            <div className="task-container">
              <div className="task-item-container">
                <span> Input </span>
                <button className="btn-add-task"> [Add Task] </button>
              </div>
            </div>

          </div>
        </div>
        <div className="footer-margin"></div>
      </div>

      <Footer goBack={true} signIn={false} signOut={false} />
    </>
  );
};

export default Tasks;

