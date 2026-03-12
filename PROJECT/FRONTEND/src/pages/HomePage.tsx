import PageContainer from "@/components/layout/PageContainer";
import HeroPlayer from "@/components/common/HeroPlayer";
import FeaturedTrack from "@/components/common/FeaturedTrack";

export default function HomePage() {
  return (
    <PageContainer>
      <HeroPlayer />
      <FeaturedTrack />
    </PageContainer>
  );
}
