import {
  IconText,
  Loader,
  Menu,
  Text,
  Icon,
  Breadcrumb,
  BreadcrumbElement,
  Title,
} from '@gnosis.pm/safe-react-components'
import IconButton from '@material-ui/core/IconButton'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'
import FavoriteIcon from '@material-ui/icons/Favorite'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { generatePath } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'

import Col from 'src/components/layout/Col'
import { Modal } from 'src/components/Modal'
import { safeAddressFromUrl } from 'src/logic/safe/store/selectors'
import AppCard from 'src/routes/safe/components/Apps/components/AppCard'
import AddAppIcon from 'src/routes/safe/components/Apps/assets/addApp.svg'
import { SAFE_ROUTES } from 'src/routes/routes'
import { useStateHandler } from 'src/logic/hooks/useStateHandler'
import { FETCH_STATUS } from 'src/utils/requests'

import { SearchInputCard } from './SearchInputCard'
import { NoAppsFound } from './NoAppsFound'
import { SafeApp } from '../types'
import AddAppForm from './AddAppForm'
import { useAppList } from '../hooks/appList/useAppList'
import { useAppsSearch } from '../hooks/useAppsSearch'

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const centerCSS = css`
  display: flex;
  align-items: center;
  justify-content: center;
`

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  ${centerCSS};
`

const CardsWrapper = styled(motion.div)`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(243px, 1fr));
  column-gap: 20px;
  row-gap: 20px;
  justify-content: space-evenly;
  margin: ${({ theme }) => `${theme.margin.xxl} 0 ${theme.margin.lg} 0`};
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
`

const IconBtn = styled(IconButton)`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  padding: 5px;
  opacity: 0;

  transition: opacity 0.2s ease-in-out;
`

const CenterIconText = styled(IconText)`
  justify-content: center;
`

const AppContainer = styled(motion.div)`
  position: relative;

  &:hover {
    ${IconBtn} {
      opacity: 1;
    }
  }
`

const isAppLoading = (app: SafeApp) => FETCH_STATUS.LOADING === app.fetchStatus

const AppsList = (): React.ReactElement => {
  const safeAddress = useSelector(safeAddressFromUrl)
  const appsPath = generatePath(SAFE_ROUTES.APPS, {
    safeAddress,
  })
  const [appSearch, setAppSearch] = useState('')
  const { appList, removeApp, isLoading, pinnedSafeApps, togglePin, customApps } = useAppList()
  const apps = useAppsSearch(appList, appSearch)
  const [appToRemove, setAppToRemove] = useState<SafeApp | null>(null)
  const { open: isAddAppModalOpen, toggle: openAddAppModal, clickAway: closeAddAppModal } = useStateHandler()
  const noAppsFound = apps.length === 0 && appSearch

  if (isLoading || !safeAddress) {
    return (
      <LoadingContainer>
        <Loader size="md" />
      </LoadingContainer>
    )
  }

  return (
    <Wrapper>
      <Menu>
        <Col start="sm" xs={12}>
          <Breadcrumb>
            <BreadcrumbElement iconType="apps" text="Apps" />
          </Breadcrumb>
        </Col>
      </Menu>
      <ContentWrapper>
        <SearchInputCard value={appSearch} onValueChange={(value) => setAppSearch(value.replace(/\s{2,}/g, ' '))} />
        {noAppsFound && <NoAppsFound query={appSearch} onWalletConnectSearch={() => setAppSearch('WalletConnect')} />}
        <Title size="xs">Pinned apps</Title>
        <AnimatePresence>
          <CardsWrapper>
            {pinnedSafeApps.map((a) => (
              <AppContainer key={a.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AppCard
                  to={`${appsPath}?appUrl=${encodeURI(a.url)}`}
                  isLoading={isAppLoading(a)}
                  iconUrl={a.iconUrl}
                  name={a.name}
                  description={a.description}
                />
                <IconBtn
                  title="Unpin"
                  onClick={(e) => {
                    e.stopPropagation()

                    togglePin(a.id)
                  }}
                >
                  <FavoriteIcon />
                </IconBtn>
              </AppContainer>
            ))}
          </CardsWrapper>
        </AnimatePresence>

        <Title size="xs">Custom apps</Title>
        <AnimatePresence>
          <CardsWrapper>
            {customApps.map((a) => (
              <AppContainer key={a.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AppCard
                  to={`${appsPath}?appUrl=${encodeURI(a.url)}`}
                  isLoading={isAppLoading(a)}
                  iconUrl={a.iconUrl}
                  name={a.name}
                  description={a.description}
                />
                <IconBtn
                  title="Remove app"
                  onClick={(e) => {
                    e.stopPropagation()

                    setAppToRemove(a)
                  }}
                >
                  <Icon size="sm" type="delete" color="error" />
                </IconBtn>
              </AppContainer>
            ))}
          </CardsWrapper>
        </AnimatePresence>

        <Title size="xs">All apps</Title>
        <AnimatePresence>
          <CardsWrapper>
            {!appSearch && (
              <AppCard to="" iconUrl={AddAppIcon} onClick={openAddAppModal} buttonText="Add custom app" iconSize="lg" />
            )}
            {apps.map((a) => (
              <AppContainer key={a.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AppCard
                  to={`${appsPath}?appUrl=${encodeURI(a.url)}`}
                  isLoading={isAppLoading(a)}
                  iconUrl={a.iconUrl}
                  name={a.name}
                  description={a.description}
                />
                <IconBtn
                  title="Pin"
                  onClick={(e) => {
                    e.stopPropagation()

                    togglePin(a.id)
                  }}
                >
                  <FavoriteBorderIcon />
                </IconBtn>
              </AppContainer>
            ))}
          </CardsWrapper>
        </AnimatePresence>
      </ContentWrapper>
      <CenterIconText
        color="secondary"
        iconSize="sm"
        iconType="info"
        text="These are third-party apps, which means they are not owned, controlled, maintained or audited by Gnosis. Interacting with the apps is at your own risk. Any communication within the Apps is for informational purposes only and must not be construed as investment advice to engage in any transaction."
        textSize="sm"
      />

      {isAddAppModalOpen && (
        <Modal title="Add app" description="Add a custom app to the list of apps" handleClose={closeAddAppModal}>
          <Modal.Header onClose={closeAddAppModal}>
            <Modal.Header.Title>Add custom app</Modal.Header.Title>
          </Modal.Header>
          <AddAppForm closeModal={closeAddAppModal} appList={appList} />
        </Modal>
      )}

      {appToRemove && (
        <Modal title="Remove app" description="Confirm for the app removal" handleClose={() => setAppToRemove(null)}>
          <Modal.Header onClose={() => setAppToRemove(null)}>
            <Modal.Header.Title>Remove app</Modal.Header.Title>
          </Modal.Header>
          <Modal.Body>
            <Text size="xl">
              This action will remove{' '}
              <Text size="xl" strong as="span">
                {appToRemove.name}
              </Text>{' '}
              from the interface
            </Text>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Footer.Buttons
              cancelButtonProps={{ onClick: () => setAppToRemove(null) }}
              confirmButtonProps={{
                color: 'error',
                onClick: () => {
                  removeApp(appToRemove.id)
                  setAppToRemove(null)
                },
                text: 'Remove',
              }}
            />
          </Modal.Footer>
        </Modal>
      )}
    </Wrapper>
  )
}

export default AppsList
