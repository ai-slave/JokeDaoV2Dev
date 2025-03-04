import shallow from "zustand/shallow";
import Button from "@components/Button";
import { ROUTE_VIEW_CONTEST, ROUTE_VIEW_CONTEST_REWARDS } from "@config/routes";
import { useForm } from "@felte/react";
import { validator } from "@felte/validator-zod";
import { addMinutes } from "date-fns";
import Link from "next/link";
import { DialogModalDeployTransaction } from "../DialogModalDeployTransaction";
import { useStore } from "../store";
import Form from "./Form";
import { schema } from "./schema";
import { useDeployContest } from "./useDeployContest";
import Timeline from "../Timeline";
import DialogModalMintProposalToken from "./DialogModalMintProposalToken";
import stylesStepperTxTracker from "@components/TrackerDeployTransaction/styles.module.css";
import DialogModal from "@components/DialogModal";

export const Step3 = () => {
  const {
    contestDeployedToChain,
    setCurrentStep,
    dataDeployVotingToken,
    modalDeployContestOpen,
    setModalDeployContestOpen,
    dataDeployContest,
    modalDeploySubmissionTokenOpen,
    dataContestRewardsModule,
    dataDeployRewardsModule,
    willHaveRewardsModule,
  } = useStore(
    state => ({
      //@ts-ignore
      dataContestRewardsModule: state.dataContestRewardsModule,
      //@ts-ignore
      dataDeployRewardsModule: state.dataDeployRewardsModule,
      //@ts-ignore
      willHaveRewardsModule: state.willHaveRewardsModule,
      //@ts-ignore
      setCurrentStep: state.setCurrentStep,
      //@ts-ignore
      dataDeployVotingToken: state.dataDeployVotingToken,
      //@ts-ignore
      modalDeployContestOpen: state.modalDeployContestOpen,
      //@ts-ignore
      setModalDeployContestOpen: state.setModalDeployContestOpen,
      //@ts-ignore
      setModalDeployContestOpen: state.setModalDeployContestOpen,
      //@ts-ignore
      contestDeployedToChain: state.contestDeployedToChain,
      //@ts-ignore
      dataDeployContest: state.dataDeployContest,
      //@ts-ignore
      modalDeploySubmissionTokenOpen: state.modalDeploySubmissionTokenOpen,
    }),
    shallow,
  );
  /*
    add 10min to the current datetime to anticipate
    the user actions on the form and prevent 
    the datetime to be expired by the time 
    the user is finished filling up the form
  */
  const date = addMinutes(new Date(), 10);

  const form = useForm({
    initialValues: {
      whoCanSubmit: "anybody",
      votingTokenAddress: dataDeployVotingToken?.address ?? null,
      datetimeOpeningSubmissions: new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, -8), // get current local time in ISO format without seconds & milliseconds
      datetimeOpeningVoting: "",
      datetimeClosingVoting: "",
      submissionOpenToAll: true,
      noSubmissionLimitPerUser: false,
      submissionMaxNumber: 200,
      requiredNumberOfTokensToSubmit: 1,
      submissionPerUserMaxNumber: 1,
      usersQualifyToVoteIfTheyHoldTokenOnVoteStart: true,
      downvoting: false,
      rewardsType: "noRewards",
      rewardTokenAddress: "",
      rewards: [],
    },
    extend: validator({ schema }),
    onSubmit: values => handleSubmitForm(values),
  });
  const { handleSubmitForm, stateContestDeployment } = useDeployContest(form);

  return (
    <>
      <div className="tracking-wide pb-8">
        <h2 className="sr-only">Step 3: Create contest</h2>
        <p className="font-bold text-lg mb-2">Let’s set the rules for your contest across two stages.</p>
        <ul className="mb-3 list-disc pis-4 text-neutral-12">
          <li>
            <span className="font-bold">submissions:</span> participants submit entries responding to a prompt.
          </li>
          <li>
            <span className="font-bold">voting:</span> your community votes on the entries.
          </li>
        </ul>
        <p className="text-neutral-11 text-xs mb-8">note: voting starts when submissions end.</p>

        <Timeline />
      </div>
      <Form isDeploying={stateContestDeployment.isLoading} {...form} />
      {modalDeploySubmissionTokenOpen && <DialogModalMintProposalToken formCreateContestSetFields={form.setFields} />}
      {willHaveRewardsModule === false || !willHaveRewardsModule ? (
        <>
          <DialogModalDeployTransaction
            isOpen={modalDeployContestOpen}
            setIsOpen={setModalDeployContestOpen}
            title="Contest deployment transaction"
            isError={stateContestDeployment.isError}
            isLoading={stateContestDeployment.isLoading}
            isSuccess={stateContestDeployment.isSuccess}
            error={stateContestDeployment.error}
            //@ts-ignore
            transactionHref={`${contestDeployedToChain?.blockExplorers?.default?.url}/tx/${dataDeployContest?.hash}`}
            textPending="Deploying contest..."
          >
            {dataDeployContest?.address && (
              <div className="mt-6 font-bold animate-appear relative">
                <Link
                  href={{
                    pathname: ROUTE_VIEW_CONTEST,
                    //@ts-ignore
                    query: {
                      chain: contestDeployedToChain?.name.toLowerCase().replace(" ", ""),
                      address: dataDeployContest?.address,
                    },
                  }}
                >
                  <a target="_blank">
                    View contest <span className="link">here</span>
                  </a>
                </Link>
              </div>
            )}

            <div className="pt-6 flex flex-col space-y-3 xs:flex-row xs:space-y-0 xs:space-i-3">
              <Button
                className="w-full py-1 xs:min-w-fit-content xs:w-auto"
                onClick={() => setCurrentStep(4)}
                disabled={!stateContestDeployment.isSuccess}
                intent="neutral-outline"
              >
                Next
              </Button>
              {stateContestDeployment.isError && (
                <Button
                  onClick={() => {
                    handleSubmitForm(form.data());
                  }}
                  className="w-full py-1 xs:w-auto xs:min-w-fit-content"
                  disabled={stateContestDeployment.isLoading}
                  intent="neutral-outline"
                  type="submit"
                >
                  Try again
                </Button>
              )}
            </div>
          </DialogModalDeployTransaction>
        </>
      ) : (
        <>
          <DialogModal
            isOpen={modalDeployContestOpen}
            setIsOpen={setModalDeployContestOpen}
            title="Contest deployment transaction"
          >
            <ol className={`space-y-4 leading-[1.75] font-bold ${stylesStepperTxTracker.stepper}`}>
              <li
                className={`${stateContestDeployment.isError === true ? "text-negative-11" : "text-primary-10"} ${
                  stateContestDeployment.isLoading === true && !dataDeployContest?.address ? "animate-pulse" : ""
                }`}
              >
                {stateContestDeployment.isError ? "Something went wrong during deployment." : "Deploying contest..."}
              </li>
              <li
                className={`${
                  stateContestDeployment.isError === true
                    ? "text-negative-11"
                    : !dataDeployContest?.address
                    ? "text-neutral-8"
                    : "text-primary-10"
                } ${
                  stateContestDeployment.isLoading === true &&
                  dataDeployContest?.address &&
                  !dataDeployRewardsModule?.address
                    ? "animate-pulse"
                    : ""
                }`}
              >
                {stateContestDeployment.isError
                  ? "Something went wrong during deployment."
                  : "Deploying rewards pool..."}
              </li>
              <li
                className={`${
                  stateContestDeployment.isError === true
                    ? "text-negative-11"
                    : !dataDeployContest?.address || !dataDeployRewardsModule?.address
                    ? "text-neutral-8"
                    : "text-primary-10"
                } ${
                  stateContestDeployment.isLoading === true &&
                  dataDeployContest?.address &&
                  dataDeployRewardsModule?.address
                    ? "animate-pulse"
                    : ""
                }`}
              >
                {stateContestDeployment.isError
                  ? "Something went wrong during deployment."
                  : "Connecting pool to contest..."}
              </li>

              <li className={stateContestDeployment.isSuccess === true ? "text-primary-10" : "text-neutral-8"}>
                Deployed!
              </li>
            </ol>
            {dataDeployContest?.address && dataContestRewardsModule?.hash && (
              <div className="mt-6 flex font-bold animate-appear relative">
                <Link
                  href={{
                    pathname: ROUTE_VIEW_CONTEST_REWARDS,
                    //@ts-ignore
                    query: {
                      chain: contestDeployedToChain?.name.toLowerCase().replace(" ", ""),
                      address: dataDeployContest?.address,
                      tokenRewardsAddress: dataContestRewardsModule.tokenRewardsAddress,
                      totalRewards: 0,
                    },
                  }}
                >
                  <a target="_blank">
                    Add funds to your contest rewards module <span className="link">here</span>.
                  </a>
                </Link>
              </div>
            )}
            <div className="mt-6">
              <h3 className="font-bold mb-2">Transactions:</h3>
              {stateContestDeployment.isLoading && (
                <p className="animate-appear mb-2 italic text-neutral-11">
                  Links to your successful transactions will appear below.
                </p>
              )}
              <ul className="space-y-3 list-disc pis-3">
                {dataDeployContest?.hash && (
                  <li className="animate-appear">
                    <a
                      rel="nofollow noreferrer"
                      target="_blank"
                      href={`${contestDeployedToChain?.blockExplorers?.default?.url}/tx/${dataDeployContest?.hash}`}
                    >
                      View contest deployment transaction <span className="link">here</span>
                    </a>
                  </li>
                )}
                {dataDeployRewardsModule?.hash && (
                  <li className="animate-appear">
                    <a
                      rel="nofollow noreferrer"
                      target="_blank"
                      href={`${contestDeployedToChain?.blockExplorers?.default?.url}/tx/${dataDeployRewardsModule?.hash}`}
                    >
                      View rewards pool deployment transaction <span className="link">here</span>
                    </a>
                  </li>
                )}
                {dataContestRewardsModule?.hash && (
                  <li className="animate-appear">
                    <a
                      rel="nofollow noreferrer"
                      target="_blank"
                      href={`${contestDeployedToChain?.blockExplorers?.default?.url}/tx/${dataContestRewardsModule?.hash}`}
                    >
                      View connecting rewards pool to contest transaction <span className="link">here</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div className="pt-6 flex flex-col space-y-3 xs:flex-row xs:space-y-0 xs:space-i-3">
              <Button
                className="w-full py-1 xs:min-w-fit-content xs:w-auto"
                onClick={() => setCurrentStep(4)}
                disabled={!stateContestDeployment.isSuccess}
                intent="neutral-outline"
              >
                Next
              </Button>
              {stateContestDeployment.isError && (
                <Button
                  onClick={() => {
                    handleSubmitForm(form.data());
                  }}
                  className="w-full py-1 xs:w-auto xs:min-w-fit-content"
                  disabled={stateContestDeployment.isLoading}
                  intent="neutral-outline"
                  type="submit"
                >
                  Try again
                </Button>
              )}
            </div>
          </DialogModal>
        </>
      )}
    </>
  );
};

export default Step3;
