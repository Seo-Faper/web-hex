import React, { useState, useRef } from "react";
import { Button, Container, Row, Col, Tabs, Tab, CloseButton } from "react-bootstrap";
import ThumbCacheUploader from "./ThumbCacheUpload";

function App() {
  const [files, setFiles] = useState([]);
  const inputRef = useRef();
  const dropRef = useRef();

  const handleFileChange = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const bytes = new Uint8Array(arrayBuffer);
    
      let hex = '';
      let ascii = '';
      for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0').toUpperCase() + ' ';
        ascii += bytes[i] >= 48 && bytes[i] <= 126 ? String.fromCharCode(bytes[i]) : '.';
      }
    
      let formattedHex = '';
      let formattedAscii = '';
      while (hex.length > 0) {
        if (hex.length > 48) {
          formattedHex += hex.substring(0, 48) + '\n';
          formattedAscii += ascii.substring(0, 24) + '\n';
          hex = hex.substring(48);
          ascii = ascii.substring(24);
        } else {
          formattedHex += hex + '\n';
          formattedAscii += ascii + '\n';
          hex = '';
          ascii = '';
        }
      }
    
      setFiles((prevFiles) => [...prevFiles, { name: file.name, hex: formattedHex, ascii: formattedAscii }]);
    };
    

    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'file') {
          const file = e.dataTransfer.items[i].getAsFile();
          handleFileChange(file);
        }
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUploadClick = () => {
    inputRef.current.click();
  };

  const handleFileInput = (e) => {
    handleFileChange(e.target.files[0]);
  };

  const handleClose = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <Container>
      <ThumbCacheUploader/>
      <Row className="justify-content-center mt-5">
        <Col xs={12} md={6}>
          <input type="file" ref={inputRef} onChange={handleFileInput} style={{ display: 'none' }} />
          <Button onClick={handleUploadClick}>파일 업로드</Button>
          <div ref={dropRef} onDrop={handleDrop} onDragOver={handleDragOver} style={{ height: '200px', border: '1px dashed #ddd', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            파일을 여기로 드래그 앤 드롭하세요
          </div>
        </Col>
        <Col xs={12} md={6}>
          <Tabs defaultActiveKey={0} id="uncontrolled-tab-example" className="mb-3">
            {files.map((file, index) => (
              <Tab
                eventKey={index}
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {file.name}
                    <CloseButton onClick={(e) => { e.stopPropagation(); handleClose(index); }} />
                  </div>
                }
                key={index}
              >
                <pre>
                  {'00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F\n'}
                  <div style={{ display: "flex" }}>
                    <span>{file.hex}</span>
                    <span>{file.ascii}</span>
                  </div>

                </pre>
              </Tab>
            ))}
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
