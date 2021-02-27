import React, { useEffect, useState, useContext } from "react";
import { Form, Col, FormControl, Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import Axios from "axios";
import * as moment from "moment";
import "moment/locale/th";
const Listhidereport = ({ reportelement, CancleClick, DeleteClick }) => {
  const [UsernamePost, SetUsernamePost] = useState("");
  const [Show, setShow] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [UsernameReport, SetUsernameReport] = useState("");
  const [checkselectOne, setCheckSelectOne] = useState(false);
  const [checkselectTwo, setCheckSelectTwo] = useState(false);
  const [checkselectThree, setCheckSelectThree] = useState(false);
  const handleShow = (e) => {
    e.preventDefault();
    setShow(true);
  };
  const handleClose = () => {
    setShow(false);
  };
  const InitReport = async () => {
    try {
      InitOtherData();
      const usernamepost = await Axios.get(
        `http://localhost:7000/post/mypost/${reportelement.postid}`
      );
      SetUsernamePost(usernamepost.data.item);
      const usernamereport = await Axios.get(
        `http://localhost:7000/user/session/${reportelement.userreport}`
      );
      SetUsernameReport(usernamereport.data.item);
    } catch (err) {
      console.log(err);
    }
  };
  const InitOtherData = () => {
    if (reportelement.selectOne === "") {
      setCheckSelectOne(false);
    } else if (reportelement.selectOne != "") {
      setCheckSelectOne(true);
    }
    if (reportelement.selectTwo === "") {
      setCheckSelectTwo(false);
    } else if (reportelement.selectTwo != "") {
      setCheckSelectTwo(true);
    }
    if (reportelement.selectThree === "") {
      setCheckSelectThree(false);
    } else if (reportelement.selectThree != "") {
      setCheckSelectThree(true);
    }
  };
  const cancleHide = async (e) => {
    e.preventDefault();
    try {
      await Axios.post(
        `http://localhost:7000/post/report/changeread/${reportelement.uid}`
      );
      CancleClick();
    } catch (err) {
      console.log(err);
    }
  };
  const deleteReport = async (e) => {
    console.log("OK");
    e.preventDefault();
    try {
      await Axios.post(
        `http://localhost:7000/post/report/delete/${reportelement.uid}`
      );
      DeleteClick();
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    InitReport();
  }, []);
  return (
    <div>
      <div className="container-history1">
        <div className="container-history2">
          <Form className="formsize-history">
            <div className="container-mypostsetiing">
              <div className="menu-containermypostsetting">
                <div
                  onClick={() => setIsActive(!isActive)}
                  className="mypostbuttonsetting"
                >
                  <img
                    className="mypostimg-setting"
                    src="/img/setting.png"
                    alt="avatar"
                  ></img>
                </div>
                <div
                  className={`mypostmenusetting ${
                    isActive ? "active" : "inactive"
                  }`}
                >
                  <ul className="ul-mypostmenusetting">
                    <li className="li-mypostmenusetting">
                      <a className="a-mypostmenusetting">
                        <a
                          className="a-mypostmenusetting1"
                          onClick={(e) => cancleHide(e)}
                        >
                          ยกเลิกการซ่อน
                        </a>
                      </a>
                    </li>
                    <li className="li-mypostmenusetting">
                      <a
                        className="a-mypostmenusetting"
                        onClick={(e) => deleteReport(e)}
                      >
                        {" "}
                        ลบประวัติการรายงาน{" "}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <Form.Row>
              <Form.Group
                as={Col}
                className="้history-left col-lg-6 col-12"
                controlId="formGridName"
              >
                <Form.Label>
                  ผุ้แจ้งการรายงาน :{" "}
                  {UsernameReport && UsernameReport[0].username}{" "}
                </Form.Label>
              </Form.Group>

              {checkselectOne ? (
                <Form.Group controlId="formBasicCheckbox">
                  <Form.Check
                    type="checkbox"
                    label="ข้อมูลไม่เหมาะสม"
                    checked
                    disabled
                  />
                </Form.Group>
              ) : (
                <Form.Group controlId="formBasicCheckbox">
                  <Form.Check
                    type="checkbox"
                    label="ข้อมูลไม่เหมาะสม"
                    disabled
                  />
                </Form.Group>
              )}
            </Form.Row>

            <Form.Row>
              <Form.Group
                as={Col}
                className="้history-left col-lg-6 col-12"
                controlId="formGridName"
              >
                <Form.Label>
                  วันเวลาที่แจ้ง :{" "}
                  {moment(new Date(reportelement.date.seconds * 1000)).format(
                    "MM/DD/YYYY HH:mm"
                  )}{" "}
                </Form.Label>
              </Form.Group>
              {checkselectTwo ? (
                <Form.Group controlId="formBasicCheckbox">
                  <Form.Check
                    type="checkbox"
                    label="ข้อมูลไม่ถูกต้อง"
                    checked
                    disabled
                  />
                </Form.Group>
              ) : (
                <Form.Group controlId="formBasicCheckbox">
                  <Form.Check
                    type="checkbox"
                    label="ข้อมูลไม่ถูกต้อง"
                    disabled
                  />
                </Form.Group>
              )}
            </Form.Row>

            <Form.Row>
              <Form.Group
                as={Col}
                className="้history-left col-lg-6 col-12"
                controlId="formGridName"
              >
                <Form.Label>
                  เจ้าของโพสต์ : {UsernamePost && UsernamePost[0].username}{" "}
                </Form.Label>
              </Form.Group>

              {checkselectThree ? (
                <Form.Group controlId="formBasicCheckbox">
                  <Form.Check type="checkbox" label="อื่นๆ" checked disabled />
                </Form.Group>
              ) : (
                <Form.Group controlId="formBasicCheckbox">
                  <Form.Check type="checkbox" label="อื่นๆ" disabled />
                </Form.Group>
              )}
            </Form.Row>

            <Form.Row>
              <Form.Group
                as={Col}
                className="้history-left col-lg-6 col-12"
                controlId="formGridName"
              >
                <Form.Label>
                  รูปหลักฐาน :
                  <div className="mypostbuttonreport">
                    <button
                      variant="primary"
                      onClick={(e) => handleShow(e)}
                      className="mypostbuttonreported"
                    >
                      คลิกเพื่อดู
                    </button>
                  </div>{" "}
                </Form.Label>
                <Form.Row>
                  <Modal
                    show={Show}
                    onHide={handleClose}
                    className="modalreport"
                  >
                    <Modal.Header closeButton>
                      <Modal.Title className="namereport">
                        รูปหลักฐาน
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bigreport1">
                      <Form.Row>
                        {reportelement.fileUploads
                          ? reportelement.fileUploads.map((element, index) => {
                              return (
                                <div className="img-holder-badslip">
                                  <a href={`${element.url}`}>
                                    <img
                                      className="img-bad"
                                      alt=""
                                      src={`${element.url}`}
                                      style={{ overflow: "hidden" }}
                                    />
                                  </a>
                                </div>
                              );
                            })
                          : null}
                      </Form.Row>
                    </Modal.Body>
                  </Modal>
                </Form.Row>
                <Form.Label>
                  จำนวนครั้งที่มีการรายงานโพสต์นี้ {reportelement.count} ครั้ง
                </Form.Label>
              </Form.Group>

              <Form.Group controlId="exampleForm.ControlTextarea1">
                <Form.Label>รายละเอียดเพิ่มเติม</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  readOnly={true}
                  value={reportelement.description}
                />
              </Form.Group>
            </Form.Row>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Listhidereport;