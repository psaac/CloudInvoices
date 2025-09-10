import React from "react";
import { Button, Modal, ModalBody, ModalTransition, ModalTitle, ModalFooter, ModalHeader } from "@forge/react";
type GenerateChargebackOutConfirmProps = {
  isOpen: boolean;
  onCancel: () => void;
  onValid: () => void;
};

const GenerateChargebackOutConfirm = ({ isOpen, onCancel, onValid }: GenerateChargebackOutConfirmProps) => {
  return (
    <>
      <ModalTransition>
        {isOpen && (
          <Modal onClose={onCancel}>
            <ModalHeader>
              <ModalTitle appearance="warning">Confirm invoice processing</ModalTitle>
            </ModalHeader>
            <ModalBody>
              There are invoices with asset errors (no Application account found), if you confirm with "Generate
              invoices" button, invoices with asset errors will be ignored.
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
export { GenerateChargebackOutConfirm };
