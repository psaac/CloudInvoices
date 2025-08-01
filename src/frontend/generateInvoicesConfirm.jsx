import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalTransition,
  ModalTitle,
  ModalFooter,
  ModalHeader,
} from "@forge/react";
const GenerateInvoicesConfirm = ({ isOpen, onCancel, onValid }) => {
  //   const [isOpen, setIsOpen] = useState(false);
  //   const openModal = () => setIsOpen(true);
  //   const cancel = () => {
  //     isOpen = false;
  //   };

  return (
    <>
      {/* <Button appearance="primary" onClick={openModal}>
        Open warning modal
      </Button> */}

      <ModalTransition>
        {isOpen && (
          <Modal onClose={onCancel}>
            <ModalHeader>
              <ModalTitle appearance="warning">
                Confirm invoice processing
              </ModalTitle>
            </ModalHeader>
            <ModalBody>
              There are invoices with asset errors (no Application account
              found), if you confirm with "Generate invoices" button, invoices
              with asset errors will be ignored.
            </ModalBody>
            <ModalFooter>
              <Button appearance="subtle" onClick={onCancel}>
                Cancel
              </Button>
              <Button appearance="warning" onClick={onValid}>
                Generate invoices
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </>
  );
};
export { GenerateInvoicesConfirm };
