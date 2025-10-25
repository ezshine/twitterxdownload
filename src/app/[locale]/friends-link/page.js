import {Card, CardHeader, CardBody, CardFooter, Link, Image} from "@heroui/react";
import { getTranslation } from '@/lib/i18n';

const friendsLink = [
    {
      name: "Travel Map Video",
      description: "Travel Map Video is a tool that allows you to create a travel map of your favorite places.",
      url: "https://travelmap.video",
      icon: "https://travelmap.video/images/logo.png"
    },
    {
        name: "PDF Tool My",
        description: "PDF Tool My is a tool that allows you to convert PDF to Word, Excel, and more.",
        url: "https://pdftoolmy.com",
        icon: "https://pdftoolmy.com/favicon.svg"
    },
    {
        name: "Temp Mail My",
        description: "Temp Mail My is a tool that allows you to create a temporary email address.",
        url: "https://tempmailmy.com",
        icon: "https://tempmailmy.com/logo.png"
    }
]

export default function FriendsLinkPage({ params: { locale } }) {
    const t = function (key) {
        return getTranslation(locale, key);
    }

    return (
        <div className="page-container py-10 flex flex-wrap gap-5 justify-between">
            {friendsLink.map((item) => (
                <Card shadow="none" className="lg:w-[32%] w-[100%] border-foreground/10 border-[1px] rounded-2xl"
                >
                    <CardHeader className="flex gap-3">
                    <Image
                        alt={item.name}
                        height={60}
                        radius="sm"
                        src={item.icon}
                        width={60}
                    />
                    <div className="flex flex-col">
                        <p className="text-md">{item.name}</p>
                        <p className="text-small text-default-500">{item.url}</p>
                    </div>
                    </CardHeader>
                    <CardBody>
                    <p>{item.description}</p>
                    </CardBody>
                    <CardFooter className="flex justify-end">
                    <Link isExternal showAnchorIcon href={item.url}>
                        {t('Open in new tab')}
                    </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}